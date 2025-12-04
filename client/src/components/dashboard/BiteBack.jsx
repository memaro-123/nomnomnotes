import { useEffect, useState } from 'react';
import { auth } from '../../firebase';
import { toast } from 'react-hot-toast';
import { 
  TrophyIcon, ForkKnifeIcon, CurrencyDollarIcon,
  StarIcon, CalendarIcon, ChartBarIcon,
  TrendUpIcon, MapPinIcon, FireIcon, SparkleIcon,
  HeartIcon, SmileyIcon
} from "@phosphor-icons/react";

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
      console.error(err);
      toast.error('Failed to load your BiteBack');
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBiteBackData(selectedYear);
  }, [selectedYear]);

  // Fun messages and emojis
  const getPriceMessage = (priceRange) => {
    const messages = {
      '$': { 
        message: "Finding hidden gems without breaking the bank! 💎",
        emoji: "💰"
      },
      '$$': { 
        message: "Great taste at sweet-spot prices! ✨",
        emoji: "🍽️"
      },
      '$$$': { 
        message: "You've got taste for finer things! Living the luxe life. 🥂",
        emoji: "👑"
      },
      '$$$$': { 
        message: "Only the best for your palate! Cheers to that. 🥂",
        emoji: "🌟"
      }
    };
    return messages[priceRange] || { message: "Exploring all price ranges! 🗺️", emoji: "🔍" };
  };

  const getCuisineMessage = (cuisine, count) => {
    if (count > 10) return `Can't get enough of ${cuisine}! You're basically a regular. 😄`;
    if (count > 5) return `${cuisine} has your heart! ♥️`;
    return `${cuisine} hits the spot! 😋`;
  };

  const getActivityMessage = (month, count) => {
    if (count > 8) return `You were on a food tour in ${month}! 🚗💨`;
    if (count > 4) return `${month} was your foodie adventure month! 🗺️`;
    return `${month} treated you well! 👌`;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!stats || stats.totalEntries === 0) {
    return <EmptyState year={selectedYear} setSelectedYear={setSelectedYear} />;
  }

  const priceInfo = getPriceMessage(stats.priceRange.range);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Header with year selector */}
        <BiteBackHeader 
          year={selectedYear} 
          onYearChange={setSelectedYear}
          totalEntries={stats.totalEntries}
        />
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <SummaryCard
            icon={<CalendarIcon size={24} weight="fill" />}
            title="Food Memories"
            value={stats.totalEntries || 0}
            subtitle="delicious moments"
            color="bg-blue-50 text-blue-700"
          />
          
          <SummaryCard
            icon={<StarIcon size={24} weight="fill" />}
            title="Top Spot"
            value={stats.topRatedRestaurant.rating || "0.0"}
            subtitle={`${stats.topRatedRestaurant.name || "—"}`}
            color="bg-amber-50 text-amber-700"
          />
          
          <SummaryCard
            icon={<ForkKnifeIcon size={24} weight="fill" />}
            title="Craving"
            value={stats.favoriteCuisine.name || "N/A"}
            subtitle={getCuisineMessage(stats.favoriteCuisine.name, stats.favoriteCuisine.count)}
            color="bg-emerald-50 text-emerald-700"
          />
          
          <SummaryCard
            icon={<TrendUpIcon size={24} weight="fill" />}
            title="Foodie Peak"
            value={stats.mostActiveMonth.name || "N/A"}
            subtitle={getActivityMessage(stats.mostActiveMonth.name, stats.mostActiveMonth.entry_count)}
            color="bg-purple-50 text-purple-700"
          />
        </div>
        
        {/* Restaurant Rankings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Most Visited */}
          <SectionCard 
            title="Your Go-To Spot" 
            icon={<MapPinIcon size={20} weight="fill" />}
            description="The place that feels like home"
          >
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <HeartIcon size={20} className="text-blue-600" weight="fill" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">{stats.mostDinedLocation.name}</h4>
                  <p className="text-sm text-gray-600">Your happy place</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <CalendarIcon size={14} />
                  <span>Visited {stats.mostDinedLocation.visit_count} time{stats.mostDinedLocation.visit_count !== 1 ? 's' : ''}</span>
                </div>
                {stats.mostDinedLocation.visit_count > 2 && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                    Regular status! 👋
                  </span>
                )}
              </div>
            </div>
            {stats.mostDinedLocation.visit_count > 1 && (
              <p className="text-center text-gray-600 text-sm mt-3">
                They probably know your order by now! 😄
              </p>
            )}
          </SectionCard>
          
          {/* Price Insights */}
          <SectionCard 
            title="Price Personality" 
            icon={<CurrencyDollarIcon size={20} weight="fill" />}
            description="How you roll"
          >
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg border border-emerald-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{priceInfo.emoji}</div>
                    <div>
                      <div className="font-bold text-3xl text-gray-800">{stats.priceRange.range}</div>
                      <p className="text-sm text-gray-600">{stats.priceRange.count} restaurants</p>
                    </div>
                  </div>
                  <CurrencyDollarIcon size={24} className="text-emerald-600" weight="fill" />
                </div>
                <p className="text-emerald-700 text-sm">
                  {priceInfo.message}
                </p>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-white rounded-lg border">
                <SmileyIcon size={20} className="text-amber-500" weight="fill" />
                <div className="flex-1">
                  <p className="text-sm text-gray-700">
                    {stats.priceRange.count === 1 
                      ? "This was your one perfect match!" 
                      : `You found ${stats.priceRange.count} winners in this range!`}
                  </p>
                </div>
              </div>
            </div>
          </SectionCard>
        </div>
        
        {/* Year in Review Card */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-8 border-2 border-amber-200">
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl">
                <TrophyIcon size={32} className="text-white" weight="fill" />
              </div>
              <h2 className="text-3xl font-bold">Your {selectedYear} Food Story</h2>
            </div>
            
            <p className="text-lg text-gray-700 mb-6 leading-relaxed">
              What a year it was! You collected <span className="font-bold text-amber-700">{stats.totalEntries}</span> food memories. 
              <br />
              <span className="font-bold">{stats.mostActiveMonth.name}</span> was your busiest foodie month, 
              and you developed a real thing for <span className="font-bold">{stats.favoriteCuisine.name}</span> cuisine.
              {stats.mostDinedLocation.name !== 'N/A' && (
                <>
                  {" "}And let's not forget about <span className="font-bold">{stats.mostDinedLocation.name}</span> — 
                  your home away from home!
                </>
              )}
            </p>
            
            <div className="flex flex-wrap justify-center gap-3">
              <div className="bg-white/80 rounded-full px-4 py-2 border flex items-center gap-2">
                <SparkleIcon size={16} className="text-amber-500" weight="fill" />
                <span className="font-medium">{stats.totalEntries} memories</span>
              </div>
              <div className="bg-white/80 rounded-full px-4 py-2 border flex items-center gap-2">
                <FireIcon size={16} className="text-red-500" weight="fill" />
                <span className="font-medium">{stats.favoriteCuisine.name} fan</span>
              </div>
              <div className="bg-white/80 rounded-full px-4 py-2 border flex items-center gap-2">
                <CurrencyDollarIcon size={16} className="text-emerald-500" weight="fill" />
                <span className="font-medium">{stats.priceRange.range} vibes</span>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-amber-300">
              <p className="text-gray-600 text-sm">
                Can't wait to see what delicious adventures {selectedYear + 1} brings! 🚀
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper components
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin mx-auto"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <ForkKnifeIcon size={24} className="text-amber-500" weight="fill" />
          </div>
        </div>
        <p className="mt-4 text-gray-600 font-medium">Cooking up your BiteBack...</p>
        <p className="text-sm text-gray-500">Getting your scrumptious stats ready</p>
      </div>
    </div>
  );
}

function EmptyState({ year, setSelectedYear }) {
  return (
    <div className="flex items-center justify-center h-full min-h-[500px]">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="w-20 h-20 bg-gradient-to-r from-amber-200 to-orange-200 rounded-full flex items-center justify-center mx-auto mb-6">
          <TrophyIcon size={40} className="text-amber-600" weight="fill" />
        </div>
        
        <h2 className="font-pacifico text-3xl text-gray-800 mb-3">No BiteBack Yet!</h2>
        <p className="text-gray-600 mb-6">
          Your food story is waiting to be written! Add some diary entries to unlock your personalized recap.
        </p>
        
        <div className="flex flex-col gap-4">
          <div className="text-sm text-gray-500">Try checking a different year:</div>
          <div className="flex justify-center gap-2">
            {[year, year - 1, year - 2].map((yr) => (
              <button
                key={yr}
                onClick={() => setSelectedYear(yr)}
                className={`px-4 py-2 rounded-lg transition-all hover:scale-105 ${
                  year === yr 
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg' 
                    : 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm border'
                }`}
              >
                {yr}
              </button>
            ))}
          </div>
        </div>
        
        <div className="mt-8 p-4 bg-amber-50 rounded-lg border border-amber-200">
          <p className="text-sm text-amber-800">
            💡 <span className="font-semibold">Pro tip:</span> Add just 3 entries to start seeing your food patterns emerge!
          </p>
        </div>
      </div>
    </div>
  );
}

function BiteBackHeader({ year, onYearChange, totalEntries }) {
  return (
    <div className="text-center space-y-4">
      <div className="inline-flex items-center gap-3">
        <SparkleIcon size={24} className="text-amber-500" weight="fill" />
        <h1 className="font-pacifico text-4xl">
          BiteBack {year}
        </h1>
        <SparkleIcon size={24} className="text-amber-500" weight="fill" />
      </div>
      <p className="text-gray-600 text-lg">
        Your delicious memories, beautifully wrapped 🎁
      </p>
      
      <div className="flex justify-center gap-2">
        {[year, year - 1, year - 2].map((yr) => (
          <button
            key={yr}
            onClick={() => onYearChange(yr)}
            className={`px-4 py-2 rounded-lg transition-all hover:scale-105 ${
              year === yr 
                ? 'bg-black text-white shadow-md' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 shadow-sm'
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
    <div className="bg-white rounded-xl p-6 shadow-sm border text-center hover:shadow-md transition-all hover:-translate-y-1">
      <div className={`w-16 h-16 rounded-full ${color} flex items-center justify-center mx-auto mb-4 relative`}>
        {icon}
        <div className="absolute -top-2 -right-2 text-xl">
          {emoji}
        </div>
      </div>
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      <div className="text-3xl font-bold mb-1">{value}</div>
      <p className="text-gray-600 text-sm">{subtitle}</p>
    </div>
  );
}

function SectionCard({ title, icon, description, children }) {
  return (
    <div className="bg-white rounded-xl p-6 border shadow-sm hover:shadow transition-shadow">
      <div className="flex items-center space-x-2 mb-2">
        {icon}
        <h2 className="text-xl font-semibold">{title}</h2>
      </div>
      {description && (
        <p className="text-gray-600 text-sm mb-4">{description}</p>
      )}
      <div className="space-y-3">
        {children}
      </div>
    </div>
  );
}