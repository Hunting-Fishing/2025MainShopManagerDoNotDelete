
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface ShoppingAnalytics {
  totalProducts: number;
  totalViews: number;
  totalClicks: number;
  conversionRate: number;
  topProducts: Array<{
    id: string;
    name: string;
    views: number;
    clicks: number;
  }>;
}

export function useShoppingAnalytics() {
  const [analytics, setAnalytics] = useState<ShoppingAnalytics>({
    totalProducts: 0,
    totalViews: 0,
    totalClicks: 0,
    conversionRate: 0,
    topProducts: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch basic product count
      const { count: productCount, error: productError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      if (productError) throw productError;

      // Since we don't have complex analytics tables, provide basic data
      setAnalytics({
        totalProducts: productCount || 0,
        totalViews: 0,
        totalClicks: 0,
        conversionRate: 0,
        topProducts: []
      });

    } catch (err: any) {
      console.error('Error fetching shopping analytics:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    analytics,
    loading,
    error,
    refetch: fetchAnalytics
  };
}
