import { 
  CalendarIcon,
  ForkKnifeIcon,
  MapPinIcon,
  StarIcon,
  TrophyIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  FireIcon
} from "@phosphor-icons/react";
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { auth } from '../../firebase';

export default function BiteBack() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  const fetchBiteBackData = async (year) => {
    setLoading(true);
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch(`http://localhost:8080/api/analytics/biteback?year=${year}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Server error response:', errorText);
        throw new Error(`Server error: ${res.status}`);
      }
      
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      } else {
        setStats(null);
        toast.error(data.error || 'Failed to load BiteBack');
      }
    } catch (err) {
      console.error('Error fetching BiteBack:', err);
      toast.error('Failed to load your BiteBack');
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBiteBackData(selectedYear);
  }, [selectedYear]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!stats || stats.totalEntries === 0) {
    return <EmptyState year={selectedYear} setSelectedYear={setSelectedYear} />;
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Header with year selector */}
        <BiteBackHeader 
          year={selectedYear} 
          onYearChange={setSelectedYear}
          totalEntries={stats.totalEntries}
        />
        
        {/* Top Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <SummaryCard
            icon={<CalendarIcon size={24} weight="fill" />}
            title="Most Active Month"
            value={stats.mostActiveMonth.name}
            subtitle={`${stats.mostActiveMonth.entry_count} entries`}
            color="bg-blue-50 text-blue-700"
            emoji="📅"
          />
          
          <SummaryCard
            icon={<ForkKnifeIcon size={24} weight="fill" />}
            title="Favorite Cuisine"
            value={stats.favoriteCuisine.name}
            subtitle={`${stats.favoriteCuisine.count} times`}
            color="bg-red-50 text-red-700"
            emoji="🍽️"
          />
          
          <SummaryCard
            icon={<StarIcon size={24} weight="fill" />}
            title="Top Rated"
            value={stats.topRatedRestaurant.name}
            subtitle={`${stats.topRatedRestaurant.rating}/5 stars`}
            color="bg-amber-50 text-amber-700"
            emoji="⭐"
          />
          
          <SummaryCard
            icon={<CurrencyDollarIcon size={24} weight="fill" />}
            title="Go-To Price"
            value={stats.priceRange.range}
            subtitle={`${stats.priceRange.count} visits`}
            color="bg-emerald-50 text-emerald-700"
            emoji="💰"
          />
          
          <SummaryCard
            icon={<MapPinIcon size={24} weight="fill" />}
            title="Most Visited"
            value={stats.mostDinedLocation.name}
            subtitle={`${stats.mostDinedLocation.visit_count} visits`}
            color="bg-purple-50 text-purple-700"
            emoji="📍"
          />
        </div>
        
        {/* Detailed Restaurant Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Most Visited Locations */}
          <SectionCard 
            title="Most Visited Places" 
            icon={<ChartBarIcon size={20} />}
            description="Your top dining spots"
          >
            <RestaurantCard
              rank={1}
              name={stats.mostDinedLocation.name}
              visits={stats.mostDinedLocation.visit_count}
              isTop
            />
            <div className="text-center py-4 text-gray-500 text-sm">
              You visited {stats.mostDinedLocation.name} {stats.mostDinedLocation.visit_count} times
              {stats.mostDinedLocation.visit_count > 3 && " - it's clearly a favorite! 🎯"}
            </div>
          </SectionCard>
          
          {/* Price & Cuisine Insights */}
          <SectionCard 
            title="Dining Insights" 
            icon={<FireIcon size={20} />}
            description="Your eating habits"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <CurrencyDollarIcon size={20} weight="fill" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Most Common Price</h4>
                    <p className="text-sm text-gray-600">{stats.priceRange.range} restaurants</p>
                  </div>
                </div>
                <div className="text-2xl font-bold">
                  {stats.priceRange.count}
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-red-100 text-red-800 flex items-center justify-center">
                    <ForkKnifeIcon size={20} weight="fill" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Favorite Cuisine</h4>
                    <p className="text-sm text-gray-600">{stats.favoriteCuisine.name}</p>
                  </div>
                </div>
                <div className="text-2xl font-bold">
                  {stats.favoriteCuisine.count}
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center">
                    <CalendarIcon size={20} weight="fill" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Peak Month</h4>
                    <p className="text-sm text-gray-600">{stats.mostActiveMonth.name}</p>
                  </div>
                </div>
                <div className="text-2xl font-bold">
                  {stats.mostActiveMonth.entry_count}
                </div>
              </div>
            </div>
          </SectionCard>
        </div>
        
        {/* Year Summary Card */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-8 border-2 border-amber-200">
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl">
                <TrophyIcon size={32} className="text-white" weight="fill" />
              </div>
              <h2 className="text-3xl font-bold">Your {selectedYear} Food Journey</h2>
            </div>
            
            <p className="text-xl text-gray-700 mb-6">
              You documented <span className="font-bold text-amber-700">{stats.totalEntries}</span> delicious experiences 
              in {selectedYear}. {stats.mostActiveMonth.name} was your most active month, 
              with a preference for <span className="font-bold">{stats.priceRange.range}</span> restaurants 
              and lots of <span className="font-bold">{stats.favoriteCuisine.name}</span> cuisine.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <StatPill label="Total Entries" value={stats.totalEntries} emoji="📝" />
              <StatPill label="Active Months" value={stats.mostActiveMonth.entry_count > 0 ? "12" : "0"} emoji="📅" />
              <StatPill label="Top Cuisine" value={stats.favoriteCuisine.name} emoji="🍽️" />
              <StatPill label="Go-To Price" value={stats.priceRange.range} emoji="💰" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Components

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
        <p className="mt-4 text-gray-600">Crunching your food data...</p>
      </div>
    </div>
  );
}

function EmptyState({ year, setSelectedYear }) {
  return (
    <div className="text-center py-12">
      <TrophyIcon size={64} className="mx-auto text-gray-400 mb-4" />
      <h2 className="text-2xl font-bold mb-2">No BiteBack Data Yet!</h2>
      <p className="text-gray-600 mb-6">
        Start adding diary entries to unlock your personalized BiteBack for {year}
      </p>
      <div className="flex justify-center gap-2">
        {[year, year - 1, year - 2].map((yr) => (
          <button
            key={yr}
            onClick={() => setSelectedYear(yr)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              year === yr 
                ? 'bg-black text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {yr}
          </button>
        ))}
      </div>
    </div>
  );
}

function BiteBackHeader({ year, onYearChange, totalEntries }) {
  return (
    <div className="text-center">
      <h1 className="font-pacifico text-4xl mb-2">
        BiteBack {year}
      </h1>
      <p className="text-gray-600 mb-6">
        A delicious recap of your {totalEntries} food adventures this year
      </p>
      <div className="flex justify-center gap-2">
        {[year, year - 1, year - 2].map((yr) => (
          <button
            key={yr}
            onClick={() => onYearChange(yr)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              year === yr 
                ? 'bg-black text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {yr}
          </button>
        ))}
      </div>
    </div>
  );
}

function SummaryCard({ icon, title, value, subtitle, color, emoji }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border text-center hover:shadow-md transition-shadow">
      <div className={`w-16 h-16 rounded-full ${color} flex items-center justify-center mx-auto mb-4`}>
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      <div className="text-3xl font-bold mb-1">
        {emoji && <span className="mr-2">{emoji}</span>}
        {value}
      </div>
      <p className="text-gray-600 text-sm">{subtitle}</p>
    </div>
  );
}

function SectionCard({ title, icon, description, children }) {
  return (
    <div className="bg-gray-50 rounded-xl p-6 border">
      <div className="flex items-center space-x-2 mb-4">
        {icon}
        <div>
          <h2 className="text-xl font-semibold">{title}</h2>
          {description && <p className="text-gray-600 text-sm">{description}</p>}
        </div>
      </div>
      <div className="space-y-3">
        {children}
      </div>
    </div>
  );
}

function RestaurantCard({ rank, name, visits, isTop }) {
  const locationName = name.length > 30 ? name.substring(0, 27) + '...' : name;
  
  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-lg border hover:bg-gray-50 transition-colors">
      <div className="flex items-center space-x-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          isTop ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white' : 'bg-gray-100 text-gray-800'
        }`}>
          <span className="font-bold">#{rank}</span>
        </div>
        <div>
          <h4 className="font-semibold">{locationName}</h4>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span className="flex items-center">
              <CalendarIcon size={12} className="mr-1" />
              {visits} {visits === 1 ? 'visit' : 'visits'}
            </span>
            {isTop && (
              <span className="flex items-center text-amber-600">
                <StarIcon size={12} className="mr-1" weight="fill" />
                Most visited
              </span>
            )}
          </div>
        </div>
      </div>
      {isTop && (
        <div className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
          Top Spot
        </div>
      )}
    </div>
  );
}

function StatPill({ label, value, emoji }) {
  return (
    <div className="bg-white rounded-full px-4 py-2 border flex items-center gap-2">
      <span>{emoji}</span>
      <span className="font-semibold">{value}</span>
      <span className="text-gray-600 text-sm">{label}</span>
    </div>
  );
}