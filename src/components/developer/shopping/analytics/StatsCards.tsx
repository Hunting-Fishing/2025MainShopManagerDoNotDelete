
import React from 'react';
import { StatCard } from './StatCard';
import { BarChart3, ShoppingBag, Award, BookOpen, ListChecks, Package } from 'lucide-react';
import { AnalyticsData } from '@/types/analytics';

interface StatsCardsProps {
  data: AnalyticsData;
}

export function StatsCards({ data }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <StatCard 
        title="Total Products" 
        value={data.totalProducts} 
        icon={<ShoppingBag className="h-5 w-5" />}
        colorClass="bg-blue-100 text-blue-800 border border-blue-300"
      />
      
      <StatCard 
        title="Approved Products" 
        value={data.approvedProducts} 
        icon={<ListChecks className="h-5 w-5" />}
        colorClass="bg-green-100 text-green-800 border border-green-300"
      />
      
      <StatCard 
        title="Featured Products" 
        value={data.featuredProducts} 
        icon={<Award className="h-5 w-5" />}
        colorClass="bg-purple-100 text-purple-800 border border-purple-300"
      />
      
      <StatCard 
        title="Categories" 
        value={data.totalCategories} 
        icon={<BookOpen className="h-5 w-5" />}
        colorClass="bg-amber-100 text-amber-800 border border-amber-300"
      />
      
      <StatCard 
        title="Manufacturers" 
        value={data.totalManufacturers} 
        icon={<Package className="h-5 w-5" />}
        colorClass="bg-red-100 text-red-800 border border-red-300"
      />
      
      <StatCard 
        title="Total Submissions" 
        value={data.totalSubmissions} 
        icon={<BarChart3 className="h-5 w-5" />}
        colorClass="bg-indigo-100 text-indigo-800 border border-indigo-300"
      />
    </div>
  );
}
