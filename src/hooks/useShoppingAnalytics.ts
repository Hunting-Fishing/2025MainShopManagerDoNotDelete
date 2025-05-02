
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

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
  const { data, isLoading, error } = useQuery({
    queryKey: ['shoppingAnalytics'],
    queryFn: async (): Promise<ShoppingAnalyticsData> => {
      try {
        // Get total products
        const productsResponse = await supabase
          .from('products')
          .select('count');
        const totalProducts = productsResponse.count || 0;

        // Get featured products
        const featuredResponse = await supabase
          .from('products')
          .select('count')
          .eq('is_featured', true);
        const featuredProducts = featuredResponse.count || 0;

        // Get total categories
        const categoriesResponse = await supabase
          .from('product_categories')
          .select('count');
        const totalCategories = categoriesResponse.count || 0;

        // Get total manufacturers
        const manufacturersResponse = await supabase
          .from('manufacturers')
          .select('count');
        const totalManufacturers = manufacturersResponse.count || 0;

        // Get products by category
        const categoryProductsResponse = await supabase
          .from('products')
          .select('category_id, product_categories(name)');
        
        const categoryProductMap = new Map<string, {name: string, count: number}>();
        if (categoryProductsResponse.data) {
          categoryProductsResponse.data.forEach(product => {
            const categoryName = product.product_categories?.name || 'Uncategorized';
            const entry = categoryProductMap.get(categoryName) || { name: categoryName, count: 0 };
            categoryProductMap.set(categoryName, { ...entry, count: entry.count + 1 });
          });
        }

        // Colors for category visualization
        const colors = ['#4287f5', '#f54242', '#f5d442', '#42f554', '#8d42f5', '#f542b3', '#42f5d1'];
        
        const productsByCategory = Array.from(categoryProductMap.values())
          .map((category, index) => ({
            ...category,
            color: colors[index % colors.length]
          }))
          .sort((a, b) => b.count - a.count);

        // Get submission data
        const submissionsResponse = await supabase
          .from('product_submissions')
          .select('count');
        const totalSubmissions = submissionsResponse.count || 0;

        // Get submission status distribution
        const submissionStatusResponse = await supabase
          .from('product_submissions')
          .select('status');

        const statusMap = new Map<string, number>();
        if (submissionStatusResponse.data) {
          submissionStatusResponse.data.forEach(submission => {
            const status = submission.status || 'pending';
            statusMap.set(status, (statusMap.get(status) || 0) + 1);
          });
        }

        const statusColors = {
          'pending': '#f5a742',
          'approved': '#42f554',
          'rejected': '#f54242',
          'modifications_requested': '#4287f5'
        };

        const submissionStatusData = Array.from(statusMap.entries())
          .map(([name, value]) => ({
            name,
            value,
            color: statusColors[name] || '#cccccc'
          }));
        
        return {
          totalProducts,
          featuredProducts,
          totalCategories,
          totalManufacturers,
          productsByCategory,
          submissionStatusData,
          totalSubmissions
        };
      } catch (error) {
        console.error("Error fetching shopping analytics data:", error);
        throw error;
      }
    },
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
    analyticsData: data,
    isLoading,
    error
  };
}
