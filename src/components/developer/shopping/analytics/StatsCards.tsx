
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Star, Users, TrendingUp } from "lucide-react";
import { supabase } from '@/lib/supabase';

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
      const { count: totalProducts, error: productsError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      if (productsError) {
        console.error('Error fetching products count:', productsError);
      }

      // Fetch featured products
      const { count: featuredProducts, error: featuredError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('featured', true);

      if (featuredError) {
        console.error('Error fetching featured products count:', featuredError);
      }

      // For categories and manufacturers, we'll use simple counts
      // to avoid the complex type instantiation issues
      let totalCategories = 0;
      let totalManufacturers = 0;

      try {
        const { data: categoryData } = await supabase
          .from('products')
          .select('category')
          .not('category', 'is', null);

        if (categoryData) {
          const uniqueCategories = new Set(categoryData.map(item => item.category));
          totalCategories = uniqueCategories.size;
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }

      try {
        const { data: manufacturerData } = await supabase
          .from('products')
          .select('manufacturer')
          .not('manufacturer', 'is', null);

        if (manufacturerData) {
          const uniqueManufacturers = new Set(manufacturerData.map(item => item.manufacturer));
          totalManufacturers = uniqueManufacturers.size;
        }
      } catch (error) {
        console.error('Error fetching manufacturers:', error);
      }

      setStats({
        totalProducts: totalProducts || 0,
        featuredProducts: featuredProducts || 0,
        totalCategories,
        totalManufacturers
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
