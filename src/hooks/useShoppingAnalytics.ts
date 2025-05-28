
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ProductByCategoryData {
  name: string;
  count: number;
  color: string;
}

interface SubmissionStatusData {
  name: string;
  value: number;
  color: string;
}

export interface ShoppingAnalyticsData {
  totalProducts: number;
  featuredProducts: number;
  totalCategories: number;
  totalManufacturers: number;
  productsByCategory: ProductByCategoryData[];
  submissionStatusData: SubmissionStatusData[];
  totalSubmissions: number;
}

export function useShoppingAnalytics() {
  const queryResult = useQuery<ShoppingAnalyticsData>({
    queryKey: ['shoppingAnalytics'],
    queryFn: fetchShoppingAnalytics,
    initialData: {
      totalProducts: 0,
      featuredProducts: 0,
      totalCategories: 0,
      totalManufacturers: 0,
      productsByCategory: [],
      submissionStatusData: [],
      totalSubmissions: 0
    }
  });

  return {
    analyticsData: queryResult.data,
    isLoading: queryResult.isLoading,
    error: queryResult.error
  };
}

async function fetchShoppingAnalytics(): Promise<ShoppingAnalyticsData> {
  try {
    // Get total products
    const { count: totalProducts } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    // Get featured products
    const { count: featuredProducts } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('featured', true);

    // Get total categories
    const { count: totalCategories } = await supabase
      .from('product_categories')
      .select('*', { count: 'exact', head: true });

    // Get total manufacturers
    const { count: totalManufacturers } = await supabase
      .from('manufacturers')
      .select('*', { count: 'exact', head: true });

    // Get products by category with category names
    const { data: productsWithCategories } = await supabase
      .from('products')
      .select(`
        id,
        category_id,
        product_categories!inner(name)
      `);

    // Process category data
    const categoryMap: Record<string, { name: string; count: number }> = {};
    
    if (productsWithCategories) {
      productsWithCategories.forEach(product => {
        if (product.product_categories) {
          const categoryName = (product.product_categories as any).name;
          if (!categoryMap[categoryName]) {
            categoryMap[categoryName] = { name: categoryName, count: 0 };
          }
          categoryMap[categoryName].count += 1;
        }
      });
    }

    // Colors for category visualization
    const colors = ['#4287f5', '#f54242', '#f5d442', '#42f554', '#8d42f5', '#f542b3', '#42f5d1'];
    
    const productsByCategory: ProductByCategoryData[] = Object.values(categoryMap)
      .map((category, index) => ({
        ...category,
        color: colors[index % colors.length]
      }))
      .sort((a, b) => b.count - a.count);

    // Get submission data (using product_submissions if it exists)
    let totalSubmissions = 0;
    let submissionStatusData: SubmissionStatusData[] = [];

    try {
      const { count } = await supabase
        .from('product_submissions')
        .select('*', { count: 'exact', head: true });
      
      totalSubmissions = count || 0;

      if (totalSubmissions > 0) {
        const { data: submissionStatusDataRaw } = await supabase
          .from('product_submissions')
          .select('status');

        const statusMap: Record<string, number> = {};
        if (submissionStatusDataRaw) {
          submissionStatusDataRaw.forEach(submission => {
            const status = submission.status || 'pending';
            statusMap[status] = (statusMap[status] || 0) + 1;
          });
        }

        const statusColors: Record<string, string> = {
          'pending': '#f5a742',
          'approved': '#42f554',
          'rejected': '#f54242',
          'modifications_requested': '#4287f5'
        };

        submissionStatusData = Object.entries(statusMap)
          .map(([name, value]) => ({
            name,
            value,
            color: statusColors[name] || '#cccccc'
          }));
      }
    } catch (submissionError) {
      // Table might not exist, ignore error
      console.log('Product submissions table not found, using default values');
    }
    
    return {
      totalProducts: totalProducts || 0,
      featuredProducts: featuredProducts || 0,
      totalCategories: totalCategories || 0,
      totalManufacturers: totalManufacturers || 0,
      productsByCategory,
      submissionStatusData,
      totalSubmissions
    };
  } catch (error) {
    console.error("Error fetching shopping analytics data:", error);
    throw error;
  }
}
