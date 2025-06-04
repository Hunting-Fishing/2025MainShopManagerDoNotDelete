
import { useState, useEffect } from 'react';
import { fetchServiceCategories } from '@/lib/services/serviceApi';
import { ServiceMainCategory } from '@/types/serviceHierarchy';

export const useServiceCategories = () => {
  const [categories, setCategories] = useState<ServiceMainCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadServiceCategories();
  }, []);

  const loadServiceCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Loading service categories via useServiceCategories hook...');
      
      const data = await fetchServiceCategories();
      console.log('✅ Service categories loaded:', {
        categoriesCount: data.length,
        totalSubcategories: data.reduce((sum, cat) => sum + cat.subcategories.length, 0),
        totalJobs: data.reduce((sum, cat) => sum + cat.subcategories.reduce((subSum, sub) => subSum + sub.jobs.length, 0), 0)
      });
      
      setCategories(data);
    } catch (err) {
      console.error('❌ Error in useServiceCategories:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch service categories');
    } finally {
      setLoading(false);
    }
  };

  return {
    categories,
    loading,
    error,
    refetch: loadServiceCategories
  };
};
