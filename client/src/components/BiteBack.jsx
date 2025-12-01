// client/src/components/BiteBack.jsx
import { useEffect, useState } from 'react';
import { auth } from '../firebase';
import { toast } from 'react-hot-toast';
import { 
  TrophyIcon, ForkKnifeIcon, CurrencyDollarIcon,
  StarIcon, CalendarIcon, TagIcon, ChartBarIcon,
  TrendUpIcon, MapPinIcon, UsersIcon
} from "@phosphor-icons/react";

export default function BiteBack() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const fetchBiteBackData = async (year) => {
    try {
      const token = await auth.currentUser.getIdToken();
      // Use the new endpoint
      const res = await fetch(`http://localhost:8080/api/analytics/biteback/${year}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const data = await res.json();
      if (data.success) {
        setAnalytics(data.data);
      } else {
        setAnalytics(null);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load your BiteBack');
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

  if (!analytics || !analytics.hasData) {
    return <EmptyState year={selectedYear} setSelectedYear={setSelectedYear} />;
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Header with year selector */}
        <BiteBackHeader 
          year={selectedYear} 
          onYearChange={setSelectedYear}
          cached={analytics.cached}
          generatedAt={analytics.generatedAt}
        />
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <SummaryCard
            icon={<CalendarIcon size={24} />}
            title="Total Entries"
            value={analytics.summary?.totalEntries || 0}
            subtitle="meals documented"
            color="bg-blue-50 text-blue-700"
          />
          
          <SummaryCard
            icon={<StarIcon size={24} weight="fill" />}
            title="Average Rating"
            value={analytics.ratingStats?.averageRating || "0.00"}
            subtitle="overall score"
            color="bg-amber-50 text-amber-700"
          />
          
          <SummaryCard
            icon={<ForkKnifeIcon size={24} />}
            title="Top Cuisine"
            value={analytics.topCuisines?.[0]?.cuisine || "N/A"}
            subtitle={`${analytics.topCuisines?.[0]?.count || 0} times`}
            color="bg-emerald-50 text-emerald-700"
          />
          
          <SummaryCard
            icon={<TrendUpIcon size={24} />}
            title="Most Active Month"
            value={analytics.monthlyDistribution ? 
              Object.entries(analytics.monthlyDistribution)
                .reduce((a, b) => a[1] > b[1] ? a : b)[0] : "N/A"}
            subtitle="peak foodie season"
            color="bg-purple-50 text-purple-700"
          />
        </div>
        
        {/* Restaurant Rankings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Most Visited */}
          <SectionCard title="Most Visited Restaurants" icon={<MapPinIcon size={20} />}>
            {analytics.topRestaurants?.map((restaurant, index) => (
              <RestaurantCard
                key={restaurant.name}
                rank={index + 1}
                name={restaurant.name}
                visits={restaurant.count}
                rating={restaurant.avgRating}
                isMostVisited={true}
              />
            ))}
          </SectionCard>
          
          {/* Best Rated */}
          <SectionCard title="Best Rated Restaurants" icon={<StarIcon size={20} weight="fill" />}>
            {analytics.bestRatedRestaurants?.map((restaurant, index) => (
              <RestaurantCard
                key={restaurant.name}
                rank={index + 1}
                name={restaurant.name}
                visits={restaurant.visits}
                rating={restaurant.averageRating}
                isMostVisited={false}
              />
            ))}
          </SectionCard>
        </div>
        
        {/* More sections for cuisine, price, labels, etc. */}
        {/* ... */}
      </div>
    </div>
  );
}

// Helper components
function RestaurantCard({ rank, name, visits, rating, isMostVisited }) {
  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-lg border hover:bg-gray-50 transition-colors">
      <div className="flex items-center space-x-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          rank === 1 ? 'bg-yellow-100 text-yellow-800' :
          rank === 2 ? 'bg-gray-100 text-gray-800' :
          'bg-orange-100 text-orange-800'
        }`}>
          <span className="font-bold">#{rank}</span>
        </div>
        <div>
          <h4 className="font-semibold">{name}</h4>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span className="flex items-center">
              <CalendarIcon size={12} className="mr-1" />
              {visits} {visits === 1 ? 'visit' : 'visits'}
            </span>
            <span className="flex items-center">
              <StarIcon size={12} className="mr-1" />
              {rating} ★
            </span>
          </div>
        </div>
      </div>
      <div className={`px-3 py-1 rounded-full text-sm font-medium ${
        isMostVisited ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
      }`}>
        {isMostVisited ? 'Most Visited' : 'Top Rated'}
      </div>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="test-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2border-black mx-auto"></div>
      <p className="mt-4">Cooking up your BiteBack...</p>
    </div>
    </div>
  );
}

function EmptyState({ year, setSelectedYear }) {
  return (
    <div className="text-center py-12">
      <TrophyIcon size={64} className="mx-auto text-gray-400 mb-4" />
      <h2 className="text-2xl font-bold mb-2">No Data Yet!</h2>
      <p className="text-gray-600 mb-4">
        Start adding diary entries to unlock your personalized BiteBack for {year}
      </p>
      <div className="flex justify-center gap-2">
        {[2025, 2024, 2023, 2022, 2021].map(prevYear => (
          <button
            key={prevYear}
            onClick={() => setSelectedYear(prevYear)}
            className={`px-4 py-2 rounded-lg ${
              year === prevYear 
                ? 'bg-black text-white' 
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            {prevYear}
          </button>
        ))}
      </div>
    </div>
  );
}

function BiteBackHeader({ year, onYearChange, cached, generatedAt }) {
  return (
    <div className="text-center">
      <h1 className="font-pacifico text-4xl mb-2">
        Your {year} BiteBack
      </h1>
      <p className="text-gray-600 mb-4">
        A delicious recap of your food journey this year
        {cached && generatedAt && (
          <span className="text-sm text-gray-400 block mt-1">
            Last updated: {new Date(generatedAt).toLocaleDateString()}
          </span>
        )}
      </p>
      <div className="flex justify-center gap-2">
        {[2024, 2023, 2022].map(yr => (
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

function SummaryCard({ icon, title, value, subtitle, color }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border text-center">
      <div className={`w-16 h-16 rounded-full ${color} flex items-center justify-center mx-auto mb-4`}>
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      <div className="text-3xl font-bold mb-1">{value}</div>
      <p className="text-gray-600 text-sm">{subtitle}</p>
    </div>
  );
}

function SectionCard({ title, icon, children }) {
  return (
    <div className="bg-gray-50 rounded-xl p-6">
      <div className="flex items-center space-x-2 mb-4">
        {icon}
        <h2 className="text-xl font-semibold">{title}</h2>
      </div>
      <div className="space-y-3">
        {children}
      </div>
    </div>
  );
}