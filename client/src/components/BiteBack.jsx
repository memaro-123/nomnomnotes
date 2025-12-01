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