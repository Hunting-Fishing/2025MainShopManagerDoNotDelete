
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AnalyticsData } from '@/types/analytics';

export function useShoppingAnalytics() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalProducts: 0,
    approvedProducts: 0,
    pendingProducts: 0,
    featuredProducts: 0,
    totalCategories: 0,
    totalManufacturers: 0,
    totalSubmissions: 0,
    productsByCategory: [],
    productsByManufacturer: [],
    submissionStatusData: []
  });
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      try {
        // Fetch product counts
        const { data: products, error: productsError } = await supabase
          .from('products')
          .select('*');
        
        if (productsError) throw productsError;
        
        // Fetch categories
        const { data: categories, error: categoriesError } = await supabase
          .from('product_categories')
          .select('id, name');
          
        if (categoriesError) throw categoriesError;
        
        // Fetch manufacturers
        const { data: manufacturers, error: manufacturersError } = await supabase
          .from('manufacturers')
          .select('id, name');
          
        if (manufacturersError) throw manufacturersError;
        
        // Fetch submissions
        const { data: submissions, error: submissionsError } = await supabase
          .from('product_submissions')
          .select('id, status');
          
        if (submissionsError) throw submissionsError;
        
        // Calculate metrics
        const totalProducts = products?.length || 0;
        const approvedProducts = products?.filter(p => p.is_approved).length || 0;
        const pendingProducts = totalProducts - approvedProducts;
        const featuredProducts = products?.filter(p => p.is_featured).length || 0;
        
        const totalCategories = categories?.length || 0;
        const totalManufacturers = manufacturers?.length || 0;
        const totalSubmissions = submissions?.length || 0;
        
        // Products by category
        const productsByCategory = categories?.map(category => {
          const count = products?.filter(p => p.category_id === category.id).length || 0;
          return { name: category.name, count };
        }).sort((a, b) => b.count - a.count).slice(0, 6) || [];
        
        // Products by manufacturer
        const productsByManufacturer = manufacturers?.map(manufacturer => {
          // Using manufacturer's name to match products since we don't have manufacturer_id in products
          const count = products?.filter(p => {
            // This would need to be replaced with actual logic to match products to manufacturers
            // For now, we're just making a placeholder implementation
            return p.affiliate_link.toLowerCase().includes(manufacturer.name.toLowerCase());
          }).length || 0;
          return { name: manufacturer.name, count };
        }).sort((a, b) => b.count - a.count).slice(0, 6) || [];
        
        // Submission status breakdown
        const pendingSubmissions = submissions?.filter(s => s.status === 'pending').length || 0;
        const approvedSubmissions = submissions?.filter(s => s.status === 'approved').length || 0;
        const rejectedSubmissions = submissions?.filter(s => s.status === 'rejected').length || 0;
        
        const submissionStatusData = [
          { name: 'Pending', value: pendingSubmissions },
          { name: 'Approved', value: approvedSubmissions },
          { name: 'Rejected', value: rejectedSubmissions }
        ];
        
        setAnalyticsData({
          totalProducts,
          approvedProducts,
          pendingProducts,
          featuredProducts,
          totalCategories,
          totalManufacturers,
          totalSubmissions,
          productsByCategory,
          productsByManufacturer,
          submissionStatusData
        });
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAnalytics();
  }, []);

  return { analyticsData, isLoading };
}
