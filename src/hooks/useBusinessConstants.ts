
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
        .select('*');
      
      if (typesError) throw typesError;
      
      if (typesData && typesData.length > 0) {
        setBusinessTypes(typesData.map(item => ({
          value: item.value || item.id,
          label: item.label || item.name
        })));
      } else {
        // Fallback defaults if no data exists
        const defaultBusinessTypes: BusinessConstant[] = [
          { value: 'sole_proprietorship', label: 'Sole Proprietorship' },
          { value: 'partnership', label: 'Partnership' },
          { value: 'llc', label: 'Limited Liability Company (LLC)' },
          { value: 'corporation', label: 'Corporation' },
          { value: 's_corporation', label: 'S Corporation' },
          { value: 'nonprofit', label: 'Nonprofit Organization' }
        ];
        setBusinessTypes(defaultBusinessTypes);
      }
      
      // Fetch business industries
      const { data: industriesData, error: industriesError } = await supabase
        .from('business_industries')
        .select('*');
      
      if (industriesError) throw industriesError;
      
      if (industriesData && industriesData.length > 0) {
        setBusinessIndustries(industriesData.map(item => ({
          value: item.value || item.id,
          label: item.label || item.name
        })));
      } else {
        // Fallback defaults if no data exists
        const defaultIndustries: BusinessConstant[] = [
          { value: 'automotive', label: 'Automotive' },
          { value: 'construction', label: 'Construction' },
          { value: 'retail', label: 'Retail' },
          { value: 'healthcare', label: 'Healthcare' },
          { value: 'hospitality', label: 'Hospitality' },
          { value: 'manufacturing', label: 'Manufacturing' },
          { value: 'technology', label: 'Technology' },
          { value: 'transportation', label: 'Transportation' },
          { value: 'other', label: 'Other' }
        ];
        setBusinessIndustries(defaultIndustries);
      }
      
      // Fetch payment methods
      const { data: methodsData, error: methodsError } = await supabase
        .from('payment_methods_options')
        .select('*');
      
      if (methodsError) throw methodsError;
      
      if (methodsData && methodsData.length > 0) {
        setPaymentMethods(methodsData.map(item => ({
          value: item.value || item.id,
          label: item.label || item.name
        })));
      } else {
        // Fallback defaults if no data exists
        const defaultPaymentMethods: BusinessConstant[] = [
          { value: 'cash', label: 'Cash' },
          { value: 'check', label: 'Check' },
          { value: 'credit_card', label: 'Credit Card' },
          { value: 'debit_card', label: 'Debit Card' },
          { value: 'bank_transfer', label: 'Bank Transfer' }
        ];
        setPaymentMethods(defaultPaymentMethods);
      }
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
