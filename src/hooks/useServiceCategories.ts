
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';

export const useServiceCategories = () => {
  const [categories, setCategories] = useState<ServiceMainCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchServiceCategories();
  }, []);

  const fetchServiceCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all categories, subcategories, and jobs in separate queries
      const [categoriesResult, subcategoriesResult, jobsResult] = await Promise.all([
        supabase
          .from('service_categories')
          .select('*')
          .order('position', { ascending: true }),
        supabase
          .from('service_subcategories')
          .select('*')
          .order('name', { ascending: true }),
        supabase
          .from('service_jobs')
          .select('*')
          .order('name', { ascending: true })
      ]);

      if (categoriesResult.error) throw categoriesResult.error;
      if (subcategoriesResult.error) throw subcategoriesResult.error;
      if (jobsResult.error) throw jobsResult.error;

      // Build the hierarchical structure
      const hierarchicalCategories: ServiceMainCategory[] = categoriesResult.data.map(category => {
        const categorySubcategories = subcategoriesResult.data
          .filter(sub => sub.category_id === category.id)
          .map(subcategory => {
            const subcategoryJobs = jobsResult.data
              .filter(job => job.subcategory_id === subcategory.id)
              .map(job => ({
                id: job.id,
                name: job.name,
                description: job.description,
                estimatedTime: job.estimated_time,
                price: job.price,
                subcategory_id: job.subcategory_id
              } as ServiceJob));

            return {
              id: subcategory.id,
              name: subcategory.name,
              description: subcategory.description,
              jobs: subcategoryJobs,
              category_id: subcategory.category_id
            } as ServiceSubcategory;
          });

        return {
          id: category.id,
          name: category.name,
          description: category.description,
          subcategories: categorySubcategories,
          position: category.position
        } as ServiceMainCategory;
      });

      setCategories(hierarchicalCategories);
    } catch (err) {
      console.error('Error fetching service categories:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch service categories');
    } finally {
      setLoading(false);
    }
  };

  return {
    categories,
    loading,
    error,
    refetch: fetchServiceCategories
  };
};
