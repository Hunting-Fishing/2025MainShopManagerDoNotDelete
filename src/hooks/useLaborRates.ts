
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface LaborRate {
  id: string;
  shop_id?: string;
  rate_type: string;
  hourly_rate: number;
  is_default: boolean;
  description?: string;
  created_at: string;
  updated_at: string;
}

export function useLaborRates(shopId?: string) {
  const [laborRates, setLaborRates] = useState<LaborRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLaborRates = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('labor_rates')
        .select('*')
        .order('rate_type');

      if (shopId) {
        query = query.eq('shop_id', shopId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      setLaborRates(data || []);
    } catch (err: any) {
      console.error('Error fetching labor rates:', err);
      setError(err.message);
      toast.error('Failed to load labor rates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLaborRates();
  }, [shopId]);

  const getDefaultRate = (): LaborRate | undefined => {
    return laborRates.find(rate => rate.is_default) || laborRates[0];
  };

  const getRateByType = (rateType: string): LaborRate | undefined => {
    return laborRates.find(rate => rate.rate_type === rateType);
  };

  const refetch = () => {
    fetchLaborRates();
  };

  return {
    laborRates,
    loading,
    error,
    getDefaultRate,
    getRateByType,
    refetch
  };
}
