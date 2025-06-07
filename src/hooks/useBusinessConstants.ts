import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

  const fetchBusinessConstants = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Check if we're authenticated first
      const { data: authData } = await supabase.auth.getSession();
      const isAuth = !!authData.session;
      
      // Fetch business types
      const { data: typesData, error: typesError } = await supabase
        .from('business_types')
        .select('*')
        .order('label');
      
      if (typesError) throw typesError;
      
      if (typesData && typesData.length > 0) {
        setBusinessTypes(typesData.map(item => ({
          value: item.value || item.id,
          label: item.label
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
        .select('*')
        .order('label');
      
      if (industriesError) throw industriesError;
      
      let industriesList: BusinessConstant[] = [];
      if (industriesData && industriesData.length > 0) {
        industriesList = industriesData.map(item => ({
          value: item.value || item.id,
          label: item.label
        }));
      } else {
        // Fallback defaults if no data exists
        industriesList = [
          { value: 'automotive', label: 'Automotive' },
          { value: 'construction', label: 'Construction' },
          { value: 'retail', label: 'Retail' },
          { value: 'healthcare', label: 'Healthcare' },
          { value: 'hospitality', label: 'Hospitality' },
          { value: 'manufacturing', label: 'Manufacturing' },
          { value: 'technology', label: 'Technology' },
          { value: 'transportation', label: 'Transportation' }
        ];
      }
      
      // Always ensure "other" option is available for industries
      if (!industriesList.some(i => i.value === 'other')) {
        industriesList.push({ value: 'other', label: 'Other' });
      }
      
      setBusinessIndustries(industriesList);
      
      // Fetch payment methods
      const { data: methodsData, error: methodsError } = await supabase
        .from('payment_methods_options')
        .select('*');
      
      if (methodsError) throw methodsError;
      
      if (methodsData && methodsData.length > 0) {
        setPaymentMethods(methodsData.map(item => ({
          value: item.value || item.id,
          label: item.label
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
    } catch (err: any) {
      console.error('Error fetching business constants:', err);
      setError('Failed to load business data: ' + (err.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinessConstants();
  }, []);

  return { 
    businessTypes, 
    businessIndustries, 
    paymentMethods, 
    isLoading, 
    error, 
    fetchBusinessConstants 
  };
}
