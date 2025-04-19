
import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

export const useServiceCategories = () => {
  const fetchServiceCategories = useCallback(async () => {
    const { data, error } = await supabase
      .from('service_categories')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Error fetching service categories:', error);
      toast({
        title: "Error",
        description: "Could not load service categories",
        variant: "destructive",
      });
      throw error;
    }

    return data;
  }, []);

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['serviceCategories'],
    queryFn: fetchServiceCategories,
  });

  return {
    categories,
    isLoading,
  };
};
