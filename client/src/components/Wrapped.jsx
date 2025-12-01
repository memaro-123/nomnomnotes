import { useEffect, useState } from 'react';
import { auth } from '../firebase';
import { toast } from 'react-hot-toast';
import { 
  TrophyIcon, 
  ForkKnifeIcon, 
  CurrencyDollarIcon,
  StarIcon,
  CalendarIcon,
  TagIcon,
  ChartBarIcon
} from "@phosphor-icons/react";

export default function Wrapped() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const fetchWrappedData = async (year) => {
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch(`http://localhost:8080/api/analytics/wrapped/${year}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const data = await res.json();
      if (data.success && data.hasData) {
        setAnalytics(data.data);
      } else {
        setAnalytics(null);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load your NomNom Wrapped');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWrappedData(selectedYear);
  }, [selectedYear]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
          <p className="mt-4">Cooking up your NomNom Wrapped...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <TrophyIcon size={64} className="mx-auto text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold mb-2">No Data Yet!</h2>
        <p className="text-gray-600 mb-4">
          Start adding diary entries to unlock your personalized NomNom Wrapped for {selectedYear}
        </p>
        <div className="flex justify-center gap-2">
          {[2023, 2022, 2021].map(year => (
            <button
              key={year}
              onClick={() => setSelectedYear(year)}
              className={`px-4 py-2 rounded-lg ${
                selectedYear === year 
                  ? 'bg-black text-white' 
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {year}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="font-pacifico text-4xl mb-2">
          Your {selectedYear} NomNom Wrapped
        </h1>
        <p className="text-gray-600">
          A delicious recap of your food journey this year
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Entries */}
        <StatCard
          icon={<CalendarIcon size={32} weight="fill" />}
          title="Total Entries"
          value={analytics.totalEntries}
          subtitle="meals documented"
          color="bg-blue-100 text-blue-800"
        />

        {/* Average Rating */}
        <StatCard
          icon={<StarIcon size={32} weight="fill" />}
          title="Average Rating"
          value={analytics.ratingStats.averageRating}
          subtitle="out of 5 stars"
          color="bg-amber-100 text-amber-800"
        />

        {/* Top Cuisine */}
        <StatCard
          icon={<ForkKnifeIcon size={32} weight="fill" />}
          title="Top Cuisine"
          value={analytics.topCuisines[0]?.cuisine || "N/A"}
          subtitle={`${analytics.topCuisines[0]?.count || 0} visits`}
          color="bg-green-100 text-green-800"
        />
      </div>

      {/* Top Restaurants */}
      <Section title="Your Top Restaurants" icon={<TrophyIcon size={24} />}>
        <div className="space-y-3">
          {analytics.topRestaurants.map((restaurant, index) => (
            <div key={restaurant.name} className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border">
              <div className="flex items-center space-x-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  index === 0 ? 'bg-yellow-100 text-yellow-800' :
                  index === 1 ? 'bg-gray-100 text-gray-800' :
                  'bg-orange-100 text-orange-800'
                }`}>
                  #{index + 1}
                </div>
                <span className="font-semibold">{restaurant.name}</span>
              </div>
              <span className="text-gray-600">{restaurant.count} visits</span>
            </div>
          ))}
        </div>
      </Section>

      {/* Cuisine Breakdown */}
      <Section title="Cuisine Journey" icon={<ChartBarIcon size={24} />}>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {analytics.topCuisines.map((cuisine, index) => (
            <div key={cuisine.cuisine} className="text-center p-4 bg-white rounded-lg shadow-sm border">
              <div className="text-2xl font-bold text-gray-800 mb-1">{cuisine.count}</div>
              <div className="text-sm text-gray-600">{cuisine.cuisine}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* Price Distribution */}
      <Section title="Spending Habits" icon={<CurrencyDollarIcon size={24} />}>
        <div className="flex items-end justify-center space-x-2 h-32">
          {analytics.priceDistribution.map((price, index) => (
            <div key={price.price} className="flex flex-col items-center">
              <div 
                className="bg-purple-500 rounded-t w-12 transition-all duration-500"
                style={{ height: `${(price.count / Math.max(...analytics.priceDistribution.map(p => p.count))) * 80}px` }}
              ></div>
              <div className="mt-2 font-semibold">{price.price}</div>
              <div className="text-sm text-gray-600">{price.count}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* Best Rated Restaurants */}
      {analytics.bestRatedRestaurants.length > 0 && (
        <Section title="Highest Rated Spots" icon={<StarIcon size={24} weight="fill" />}>
          <div className="space-y-3">
            {analytics.bestRatedRestaurants.map((restaurant, index) => (
              <div key={restaurant.restaurant} className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                    <StarIcon size={16} weight="fill" className="text-amber-600" />
                  </div>
                  <span className="font-semibold">{restaurant.restaurant}</span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-amber-600">{restaurant.averageRating} ★</div>
                  <div className="text-sm text-gray-600">{restaurant.visits} visits</div>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Top Labels */}
      <Section title="Your Food Personality" icon={<TagIcon size={24} />}>
        <div className="flex flex-wrap gap-2">
          {analytics.topLabels.slice(0, 8).map(label => (
            <span 
              key={label.label}
              className="px-3 py-2 bg-gray-100 rounded-full text-sm font-medium"
            >
              {label.label} ({label.count})
            </span>
          ))}
        </div>
      </Section>

      {/* Year Selector */}
      <div className="flex justify-center gap-2 pt-8">
        {[2024, 2023, 2022].map(year => (
          <button
            key={year}
            onClick={() => setSelectedYear(year)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedYear === year 
                ? 'bg-black text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {year}
          </button>
        ))}
      </div>
    </div>
    </div>
  );
}

// Helper Components
function StatCard({ icon, title, value, subtitle, color }) {
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

function Section({ title, icon, children }) {
  return (
    <div className="bg-gray-50 rounded-xl p-6">
      <div className="flex items-center space-x-2 mb-4">
        {icon}
        <h2 className="text-xl font-semibold">{title}</h2>
      </div>
      {children}
    </div>
  );
}