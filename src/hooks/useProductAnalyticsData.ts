import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ProductAnalytics {
  productId: string;
  views: number;
  clicks: number;
  conversionRate: number;
}

export function useProductAnalyticsData(productId: string) {
  const [analytics, setAnalytics] = useState<ProductAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch real analytics data from product_analytics table
        const { data, error } = await supabase
          .from('product_analytics')
          .select('interaction_type')
          .eq('product_id', productId);

        if (error) throw error;

        // Calculate real metrics from actual data
        const totalViews = data?.filter(a => a.interaction_type === 'view').length || 0;
        const totalClicks = data?.filter(a => a.interaction_type === 'click').length || 0;

        setAnalytics({
          productId,
          views: totalViews,
          clicks: totalClicks,
          conversionRate: totalViews > 0 ? (totalClicks / totalViews) * 100 : 0
        });

      } catch (err: any) {
        console.error('Error fetching product analytics:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [productId]);

  return {
    analytics,
    loading,
    error
  };
}

