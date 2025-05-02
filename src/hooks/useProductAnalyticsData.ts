
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { ProductInteractionType } from '@/components/developer/shopping/analytics/AnalyticsTracker';
import { 
  ProductAnalyticsData, 
  TopProduct, 
  AnalyticsSummary 
} from '@/types/analytics';

interface ProductAnalyticsResult {
  analyticsData: ProductAnalyticsData;
  topProducts: {
    views: TopProduct[];
    clicks: TopProduct[];
  };
  mostSavedProducts: TopProduct[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export const useProductAnalyticsData = (): ProductAnalyticsResult => {
  const fetchAnalyticsData = async (): Promise<ProductAnalyticsData> => {
    // Fetch view counts per category
    const { data: categoryData, error: categoryError } = await supabase
      .from('product_analytics')
      .select('category, count(*)')
      .eq('interaction_type', ProductInteractionType.VIEW)
      .group('category');

    if (categoryError) throw categoryError;

    // Fetch total views, clicks, saves counts
    const { data: viewsData, error: viewsError } = await supabase
      .from('product_analytics')
      .select('count(*)', { count: 'exact' })
      .eq('interaction_type', ProductInteractionType.VIEW);

    if (viewsError) throw viewsError;
    
    const { data: clicksData, error: clicksError } = await supabase
      .from('product_analytics')
      .select('count(*)', { count: 'exact' })
      .eq('interaction_type', ProductInteractionType.CLICK);

    if (clicksError) throw clicksError;
    
    const { data: savesData, error: savesError } = await supabase
      .from('product_analytics')
      .select('count(*)', { count: 'exact' })
      .eq('interaction_type', ProductInteractionType.SAVE);

    if (savesError) throw savesError;

    // Fetch interaction data by category
    const { data: interactionData, error: interactionError } = await supabase.rpc('get_product_interactions_by_category');

    if (interactionError) {
      // If the RPC function doesn't exist, we'll use a workaround with raw data
      const { data: rawInteractionData, error: rawError } = await supabase
        .from('product_analytics')
        .select('category, interaction_type')
        
      if (rawError) throw rawError;
      
      // Process raw data to format we need
      const processedData = Array.from(
        rawInteractionData.reduce((acc, item) => {
          if (!acc.has(item.category)) {
            acc.set(item.category, {
              name: item.category,
              views: 0,
              clicks: 0,
              saves: 0,
              shares: 0
            });
          }
          
          const record = acc.get(item.category);
          if (item.interaction_type === ProductInteractionType.VIEW) record.views++;
          if (item.interaction_type === ProductInteractionType.CLICK) record.clicks++;
          if (item.interaction_type === ProductInteractionType.SAVE) record.saves++;
          if (item.interaction_type === ProductInteractionType.SHARE) record.shares++;
          
          return acc;
        }, new Map())
      ).map(([_, value]) => value);

      const totalViews = viewsData?.count || 0;
      const totalClicks = clicksData?.count || 0;
      const totalSaves = savesData?.count || 0;
      const conversionRate = totalViews > 0 ? (totalClicks / totalViews) * 100 : 0;
      
      return {
        totalViews,
        totalClicks,
        totalSaved: totalSaves,
        conversionRate,
        categoryData: (categoryData || []).map(item => ({ 
          name: item.category, 
          count: item.count 
        })),
        interactionData: processedData
      };
    }

    // If the RPC function exists, use its results
    return {
      totalViews: viewsData?.count || 0,
      totalClicks: clicksData?.count || 0,
      totalSaved: savesData?.count || 0,
      conversionRate: viewsData?.count > 0 ? ((clicksData?.count || 0) / viewsData.count) * 100 : 0,
      categoryData: (categoryData || []).map(item => ({ 
        name: item.category, 
        count: item.count 
      })),
      interactionData: interactionData || []
    };
  };

  const fetchTopProducts = async (): Promise<{
    views: TopProduct[];
    clicks: TopProduct[];
  }> => {
    // Get top viewed products
    const { data: topViewedProducts, error: viewsError } = await supabase
      .from('product_analytics')
      .select('product_id, product_name, category, count(*)')
      .eq('interaction_type', ProductInteractionType.VIEW)
      .group('product_id, product_name, category')
      .order('count', { ascending: false })
      .limit(5);

    if (viewsError) throw viewsError;

    // Get top clicked products
    const { data: topClickedProducts, error: clicksError } = await supabase
      .from('product_analytics')
      .select('product_id, product_name, category, count(*)')
      .eq('interaction_type', ProductInteractionType.CLICK)
      .group('product_id, product_name, category')
      .order('count', { ascending: false })
      .limit(5);

    if (clicksError) throw clicksError;

    // Get total view count for percentage calculation
    const { data: totalViews, error: totalViewsError } = await supabase
      .from('product_analytics')
      .select('count(*)', { count: 'exact' })
      .eq('interaction_type', ProductInteractionType.VIEW);

    if (totalViewsError) throw totalViewsError;

    // Get total click count for percentage calculation
    const { data: totalClicks, error: totalClicksError } = await supabase
      .from('product_analytics')
      .select('count(*)', { count: 'exact' })
      .eq('interaction_type', ProductInteractionType.CLICK);

    if (totalClicksError) throw totalClicksError;

    const totalViewCount = totalViews.count || 0;
    const totalClickCount = totalClicks.count || 0;

    return {
      views: (topViewedProducts || []).map(product => ({
        id: product.product_id,
        name: product.product_name,
        category: product.category,
        count: product.count,
        percentage: totalViewCount > 0 ? (product.count / totalViewCount) * 100 : 0
      })),
      clicks: (topClickedProducts || []).map(product => ({
        id: product.product_id,
        name: product.product_name,
        category: product.category,
        count: product.count,
        percentage: totalClickCount > 0 ? (product.count / totalClickCount) * 100 : 0
      }))
    };
  };

  const fetchSavedProducts = async (): Promise<TopProduct[]> => {
    // Get most saved products
    const { data: topSavedProducts, error: savedError } = await supabase
      .from('product_analytics')
      .select('product_id, product_name, category, count(*)')
      .eq('interaction_type', ProductInteractionType.SAVE)
      .group('product_id, product_name, category')
      .order('count', { ascending: false })
      .limit(5);

    if (savedError) throw savedError;

    // Get total saved count for percentage calculation
    const { data: totalSaved, error: totalSavedError } = await supabase
      .from('product_analytics')
      .select('count(*)', { count: 'exact' })
      .eq('interaction_type', ProductInteractionType.SAVE);

    if (totalSavedError) throw totalSavedError;

    const totalSavedCount = totalSaved.count || 0;

    return (topSavedProducts || []).map(product => ({
      id: product.product_id,
      name: product.product_name,
      category: product.category,
      count: product.count,
      percentage: totalSavedCount > 0 ? (product.count / totalSavedCount) * 100 : 0
    }));
  };

  // Use React Query for data fetching with caching
  const { data: analyticsData, isLoading: isLoadingAnalytics, error: analyticsError, refetch: refetchAnalytics } = useQuery({
    queryKey: ['productAnalytics'],
    queryFn: fetchAnalyticsData
  });

  const { data: topProducts, isLoading: isLoadingTop, error: topError, refetch: refetchTop } = useQuery({
    queryKey: ['topProducts'],
    queryFn: fetchTopProducts
  });

  const { data: mostSavedProducts, isLoading: isLoadingSaved, error: savedError, refetch: refetchSaved } = useQuery({
    queryKey: ['savedProducts'],
    queryFn: fetchSavedProducts
  });

  const isLoading = isLoadingAnalytics || isLoadingTop || isLoadingSaved;
  const error = analyticsError || topError || savedError;

  const refetch = () => {
    refetchAnalytics();
    refetchTop();
    refetchSaved();
  };

  return {
    analyticsData: analyticsData || {
      totalViews: 0,
      totalClicks: 0,
      totalSaved: 0,
      conversionRate: 0,
      categoryData: [],
      interactionData: []
    },
    topProducts: topProducts || { views: [], clicks: [] },
    mostSavedProducts: mostSavedProducts || [],
    isLoading,
    error: error as Error | null,
    refetch
  };
};
