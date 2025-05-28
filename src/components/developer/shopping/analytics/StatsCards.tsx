
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Star, Users, TrendingUp } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';

interface StatsData {
  totalProducts: number;
  featuredProducts: number;
  totalCategories: number;
  totalManufacturers: number;
}

const StatsCards: React.FC = () => {
  const [stats, setStats] = useState<StatsData>({
    totalProducts: 0,
    featuredProducts: 0,
    totalCategories: 0,
    totalManufacturers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch total products
      const { count: totalProducts } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      // Fetch featured products
      const { count: featuredProducts } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('featured', true);

      // Fetch total categories
      const { count: totalCategories } = await supabase
        .from('product_categories')
        .select('*', { count: 'exact', head: true });

      // Fetch total manufacturers
      const { count: totalManufacturers } = await supabase
        .from('manufacturers')
        .select('*', { count: 'exact', head: true });

      setStats({
        totalProducts: totalProducts || 0,
        featuredProducts: featuredProducts || 0,
        totalCategories: totalCategories || 0,
        totalManufacturers: totalManufacturers || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      title: "Total Products",
      value: stats.totalProducts,
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200"
    },
    {
      title: "Featured Products",
      value: stats.featuredProducts,
      icon: Star,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200"
    },
    {
      title: "Categories",
      value: stats.totalCategories,
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200"
    },
    {
      title: "Manufacturers",
      value: stats.totalManufacturers,
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200"
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statsCards.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <Card key={index} className={`shadow-md bg-white rounded-xl border ${stat.borderColor}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value.toLocaleString()}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <IconComponent className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default StatsCards;
