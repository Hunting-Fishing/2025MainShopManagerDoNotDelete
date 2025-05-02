
import React from 'react';
import { Package, ShoppingBag, Star, Truck } from 'lucide-react';
import StatCard from './StatCard';
import { useShoppingAnalytics } from '@/hooks/useShoppingAnalytics';

const StatsCards: React.FC = () => {
  const { analyticsData, isLoading } = useShoppingAnalytics();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total Products"
        value={analyticsData.totalProducts}
        icon={<Package className="h-5 w-5 text-blue-600" />}
        className="border-t-blue-500"
        loading={isLoading}
      />
      <StatCard
        title="Featured Products"
        value={analyticsData.featuredProducts}
        description={`${Math.round((analyticsData.featuredProducts / analyticsData.totalProducts || 0) * 100)}% of catalog`}
        icon={<Star className="h-5 w-5 text-amber-500" />}
        className="border-t-amber-500"
        loading={isLoading}
      />
      <StatCard
        title="Product Categories"
        value={analyticsData.totalCategories}
        icon={<ShoppingBag className="h-5 w-5 text-green-600" />}
        className="border-t-green-500"
        loading={isLoading}
      />
      <StatCard
        title="Manufacturers"
        value={analyticsData.totalManufacturers}
        icon={<Truck className="h-5 w-5 text-purple-600" />}
        className="border-t-purple-500"
        loading={isLoading}
      />
    </div>
  );
};

export default StatsCards;
