
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase'; 
import { 
  TopProductAnalytics, 
  ProductAnalyticsData,
  CategoryAnalytics
} from '@/types/analytics';

export const useProductAnalyticsData = () => {
  // Fetch analytics data
  const { 
    data: analyticsData, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['productAnalytics'],
    queryFn: async (): Promise<ProductAnalyticsData> => {
      try {
        // Get total views
        const viewsResponse = await supabase
          .from('product_analytics')
          .select('*')
          .eq('interaction_type', 'view')
          .count();
        const totalViews = viewsResponse.count || 0;

        // Get total clicks
        const clicksResponse = await supabase
          .from('product_analytics')
          .select('*')
          .eq('interaction_type', 'click')
          .count();
        const totalClicks = clicksResponse.count || 0;

        // Get total saves
        const savesResponse = await supabase
          .from('product_analytics')
          .select('*')
          .eq('interaction_type', 'save')
          .count();
        const totalSaved = savesResponse.count || 0;

        // Calculate conversion rate
        const conversionRate = totalViews > 0
          ? (totalClicks / totalViews) * 100
          : 0;

        // Get category data
        const categoryResponse = await supabase
          .from('product_analytics')
          .select('category, count')
          .eq('interaction_type', 'view')
          .not('category', 'is', null);

        const categoryData = categoryResponse.data ? 
          categoryResponse.data.map(item => ({
            name: item.category || 'Unknown',
            count: item.count || 1
          })) : [];

        // Get category based interactions
        const { data: interactionData, error: interactionError } = await supabase.rpc(
          'get_product_interactions_by_category'
        );

        if (interactionError) {
          console.error('Error fetching interaction data:', interactionError);
        }

        return {
          totalViews,
          totalClicks,
          totalSaved,
          conversionRate,
          categoryData,
          interactionData: interactionData || []
        };
      } catch (error) {
        console.error('Error fetching product analytics:', error);
        throw error;
      }
    },
    initialData: {
      totalViews: 0,
      totalClicks: 0,
      totalSaved: 0,
      conversionRate: 0,
      categoryData: [],
      interactionData: []
    }
  });

  // Fetch top products by views
  const { data: topProductsViews } = useQuery({
    queryKey: ['topProductsViews'],
    queryFn: async (): Promise<TopProductAnalytics[]> => {
      try {
        const response = await supabase
          .from('product_analytics')
          .select('product_id, product_name, category, count(*)')
          .eq('interaction_type', 'view')
          .not('product_id', 'is', null)
          .order('count', { ascending: false })
          .limit(5);

        if (response.error) throw response.error;

        return (response.data || []).map(item => ({
          id: item.product_id,
          name: item.product_name || 'Unknown Product',
          category: item.category || 'Uncategorized',
          count: parseInt(item.count, 10) || 0,
          percentage: 0, // Will calculate after
          views: parseInt(item.count, 10) || 0
        }));
      } catch (error) {
        console.error('Error fetching top viewed products:', error);
        return [];
      }
    },
    initialData: []
  });

  // Fetch top products by clicks
  const { data: topProductsClicks } = useQuery({
    queryKey: ['topProductsClicks'],
    queryFn: async (): Promise<TopProductAnalytics[]> => {
      try {
        const response = await supabase
          .from('product_analytics')
          .select('product_id, product_name, category, count(*)')
          .eq('interaction_type', 'click')
          .not('product_id', 'is', null)
          .order('count', { ascending: false })
          .limit(5);

        if (response.error) throw response.error;

        return (response.data || []).map(item => ({
          id: item.product_id,
          name: item.product_name || 'Unknown Product',
          category: item.category || 'Uncategorized',
          count: parseInt(item.count, 10) || 0,
          percentage: 0, // Will calculate after
          clicks: parseInt(item.count, 10) || 0
        }));
      } catch (error) {
        console.error('Error fetching top clicked products:', error);
        return [];
      }
    },
    initialData: []
  });

  // Fetch most saved products
  const { data: mostSavedProducts } = useQuery({
    queryKey: ['mostSavedProducts'],
    queryFn: async (): Promise<TopProductAnalytics[]> => {
      try {
        const response = await supabase
          .from('product_analytics')
          .select('product_id, product_name, category, count(*)')
          .eq('interaction_type', 'save')
          .not('product_id', 'is', null)
          .order('count', { ascending: false })
          .limit(10);

        if (response.error) throw response.error;

        return (response.data || []).map(item => ({
          id: item.product_id,
          name: item.product_name || 'Unknown Product',
          category: item.category || 'Uncategorized',
          count: parseInt(item.count, 10) || 0,
          percentage: 0, // Will calculate after
          saves: parseInt(item.count, 10) || 0
        }));
      } catch (error) {
        console.error('Error fetching most saved products:', error);
        return [];
      }
    },
    initialData: []
  });

  // Process the top products data to include percentages
  const processedTopProducts = {
    views: topProductsViews.map(product => ({
      ...product,
      percentage: analyticsData.totalViews > 0 
        ? (product.count / analyticsData.totalViews) * 100 
        : 0
    })),
    clicks: topProductsClicks.map(product => ({
      ...product,
      percentage: analyticsData.totalClicks > 0 
        ? (product.count / analyticsData.totalClicks) * 100 
        : 0
    })),
    saves: mostSavedProducts.map(product => ({
      ...product,
      percentage: analyticsData.totalSaved > 0 
        ? (product.count / analyticsData.totalSaved) * 100 
        : 0
    }))
  };

  return {
    analyticsData,
    topProducts: processedTopProducts,
    mostSavedProducts: processedTopProducts.saves,
    isLoading,
    error,
    refetch
  };
};
