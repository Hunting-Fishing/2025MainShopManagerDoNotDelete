
import React from 'react';
import { StatCard } from './StatCard';
import { ShoppingBag, Star, TrendingUp, Users } from 'lucide-react';
import { AnalyticsData } from '@/types/analytics';

interface StatsCardsProps {
  data: AnalyticsData;
}

export function StatsCards({ data }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total Products"
        value={data.totalProducts}
        icon={<ShoppingBag className="h-6 w-6 text-blue-700" />}
        additionalInfo={
          <p className="text-xs text-slate-500">
            <span className="text-green-500 font-medium">{data.approvedProducts}</span> approved, 
            <span className="text-amber-500 font-medium"> {data.pendingProducts}</span> pending
          </p>
        }
      />

      <StatCard
        title="Featured Products"
        value={data.featuredProducts}
        icon={<Star className="h-6 w-6 text-purple-700" />}
        additionalInfo={
          <p className="text-xs text-slate-500">
            {data.totalProducts > 0 ? ((data.featuredProducts / data.totalProducts) * 100).toFixed(1) : '0'}% of products
          </p>
        }
      />

      <StatCard
        title="Categories"
        value={data.totalCategories}
        icon={<TrendingUp className="h-6 w-6 text-amber-700" />}
        additionalInfo={
          <p className="text-xs text-slate-500">
            {data.totalManufacturers} manufacturers
          </p>
        }
      />

      <StatCard
        title="Submissions"
        value={data.totalSubmissions}
        icon={<Users className="h-6 w-6 text-green-700" />}
        additionalInfo={
          <p className="text-xs text-slate-500">
            From user product suggestions
          </p>
        }
      />
    </div>
  );
}
