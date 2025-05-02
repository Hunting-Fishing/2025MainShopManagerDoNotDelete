
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
        const { count: totalProducts, error: productsError } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true });
        
        if (productsError) throw productsError;

        // Get featured products
        const { count: featuredProducts, error: featuredError } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('is_featured', true);
        
        if (featuredError) throw featuredError;

        // Get total categories
        const { count: totalCategories, error: categoriesError } = await supabase
          .from('product_categories')
          .select('*', { count: 'exact', head: true });
        
        if (categoriesError) throw categoriesError;

        // Get total manufacturers
        const { count: totalManufacturers, error: manufacturersError } = await supabase
          .from('manufacturers')
          .select('*', { count: 'exact', head: true });
        
        if (manufacturersError) throw manufacturersError;

        // Get products by category
        const { data: categoryProductsData, error: categoryProductsError } = await supabase
          .from('products')
          .select(`
            category_id,
            product_categories:category_id (name)
          `);
        
        if (categoryProductsError) throw categoryProductsError;
        
        const categoryProductMap = new Map<string, {name: string, count: number}>();
        if (categoryProductsData) {
          categoryProductsData.forEach(product => {
            // Handle the product_categories data correctly
            // Note: product.product_categories could be an array or single object depending on the join
            const categoryObj = product.product_categories;
            let categoryName = 'Uncategorized';
            
            // If it's an object with a name property
            if (categoryObj && typeof categoryObj === 'object' && 'name' in categoryObj) {
              // Ensure we have a string by converting if needed
              const nameValue = categoryObj.name;
              categoryName = typeof nameValue === 'string' ? nameValue : String(nameValue);
            }
            
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
        const { count: totalSubmissions, error: submissionsError } = await supabase
          .from('product_submissions')
          .select('*', { count: 'exact', head: true });
        
        if (submissionsError) throw submissionsError;

        // Get submission status distribution
        const { data: submissionStatusData, error: submissionStatusError } = await supabase
          .from('product_submissions')
          .select('status');
        
        if (submissionStatusError) throw submissionStatusError;

        const statusMap = new Map<string, number>();
        if (submissionStatusData) {
          submissionStatusData.forEach(submission => {
            const status = submission.status || 'pending';
            statusMap.set(status, (statusMap.get(status) || 0) + 1);
          });
        }

        const statusColors: Record<string, string> = {
          'pending': '#f5a742',
          'approved': '#42f554',
          'rejected': '#f54242',
          'modifications_requested': '#4287f5'
        };

        const submissionStatusDataArray = Array.from(statusMap.entries())
          .map(([name, value]) => ({
            name,
            value,
            color: statusColors[name] || '#cccccc'
          }));
        
        return {
          totalProducts: totalProducts || 0,
          featuredProducts: featuredProducts || 0,
          totalCategories: totalCategories || 0,
          totalManufacturers: totalManufacturers || 0,
          productsByCategory,
          submissionStatusData: submissionStatusDataArray,
          totalSubmissions: totalSubmissions || 0
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
