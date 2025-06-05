
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ServiceMainCategory, ServiceSubcategory, ServiceJob, ServiceSector } from '@/types/serviceHierarchy';
import { fetchServiceSectors, fetchServiceCategories } from '@/lib/services/serviceApi';

export const useServiceCategories = () => {
  const [categories, setCategories] = useState<ServiceMainCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchServiceCategoriesData();
  }, []);

  const fetchServiceCategoriesData = async () => {
    try {
      setLoading(true);
      setError(null);

      const categoriesData = await fetchServiceCategories();
      setCategories(categoriesData);
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
    refetch: fetchServiceCategoriesData
  };
};

export const useServiceSectors = () => {
  const [sectors, setSectors] = useState<ServiceSector[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchServiceSectorsData();
  }, []);

  const fetchServiceSectorsData = async () => {
    try {
      setLoading(true);
      setError(null);

      const sectorsData = await fetchServiceSectors();
      setSectors(sectorsData);
    } catch (err) {
      console.error('Error fetching service sectors:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch service sectors');
    } finally {
      setLoading(false);
    }
  };

  return {
    sectors,
    loading,
    error,
    refetch: fetchServiceSectorsData
  };
};
