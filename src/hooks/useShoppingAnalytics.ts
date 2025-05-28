
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

const defaultAnalyticsData: ShoppingAnalyticsData = {
  totalProducts: 0,
  featuredProducts: 0,
  totalCategories: 0,
  totalManufacturers: 0,
  productsByCategory: [],
  submissionStatusData: [],
  totalSubmissions: 0
};

// Explicit type for product with category data
interface ProductWithCategory {
  id: string;
  category_id: string | null;
  product_categories: {
    name: string;
  } | null;
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

    // Get products by category with explicit typing
    const productsResponse = await supabase
      .from('products')
      .select(`
        id,
        category_id,
        product_categories!inner(name)
      `);

    const productsWithCategories = productsResponse.data as ProductWithCategory[] | null;

    // Process category data
    const categoryCount: Record<string, number> = {};
    
    if (productsWithCategories) {
      productsWithCategories.forEach(product => {
        if (product.product_categories?.name) {
          const categoryName = product.product_categories.name;
          categoryCount[categoryName] = (categoryCount[categoryName] || 0) + 1;
        }
      });
    }

    // Colors for category visualization
    const colors = ['#4287f5', '#f54242', '#f5d442', '#42f554', '#8d42f5', '#f542b3', '#42f5d1'];
    
    const productsByCategory: ProductByCategoryData[] = Object.entries(categoryCount)
      .map(([name, count], index) => ({
        name,
        count,
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

        const statusCount: Record<string, number> = {};
        if (submissionStatusDataRaw) {
          submissionStatusDataRaw.forEach(submission => {
            const status = submission.status || 'pending';
            statusCount[status] = (statusCount[status] || 0) + 1;
          });
        }

        const statusColors: Record<string, string> = {
          'pending': '#f5a742',
          'approved': '#42f554',
          'rejected': '#f54242',
          'modifications_requested': '#4287f5'
        };

        submissionStatusData = Object.entries(statusCount)
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

export function useShoppingAnalytics() {
  const query = useQuery({
    queryKey: ['shoppingAnalytics'],
    queryFn: fetchShoppingAnalytics,
    initialData: defaultAnalyticsData
  });

  return {
    analyticsData: query.data || defaultAnalyticsData,
    isLoading: query.isLoading,
    error: query.error
  };
}
