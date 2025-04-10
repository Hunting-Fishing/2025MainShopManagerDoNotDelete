
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface BusinessConstant {
  value: string;
  label: string;
}

export function useBusinessConstants() {
  const [businessTypes, setBusinessTypes] = useState<BusinessConstant[]>([]);
  const [businessIndustries, setBusinessIndustries] = useState<BusinessConstant[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<BusinessConstant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBusinessConstants();
  }, []);

  const fetchBusinessConstants = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch business types
      const { data: typesData, error: typesError } = await supabase
        .from('business_types')
        .select('value, label')
        .order('label');
        
      if (typesError) throw typesError;
      setBusinessTypes(typesData);
      
      // Fetch business industries
      const { data: industriesData, error: industriesError } = await supabase
        .from('business_industries')
        .select('value, label')
        .order('label');
        
      if (industriesError) throw industriesError;
      setBusinessIndustries(industriesData);
      
      // Fetch payment methods
      const { data: paymentData, error: paymentError } = await supabase
        .from('payment_methods')
        .select('value, label')
        .order('label');
        
      if (paymentError) throw paymentError;
      setPaymentMethods(paymentData);
    } catch (err) {
      console.error('Error fetching business constants:', err);
      setError('Failed to load business data');
    } finally {
      setIsLoading(false);
    }
  };

  return { 
    businessTypes, 
    businessIndustries, 
    paymentMethods, 
    isLoading, 
    error, 
    fetchBusinessConstants 
  };
}
