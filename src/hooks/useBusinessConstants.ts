
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

// Define type for business constant
interface BusinessConstant {
  id: string;
  value: string;
  label: string;
  created_at: string;
  updated_at: string;
}

export function useBusinessConstants() {
  const [businessTypes, setBusinessTypes] = useState<BusinessConstant[]>([]);
  const [industries, setIndustries] = useState<BusinessConstant[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<BusinessConstant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBusinessConstants() {
      setLoading(true);
      setError(null);
      try {
        // Fetch business types
        const { data: businessTypesData, error: businessTypesError } = await supabase
          .from('business_types')
          .select('*');

        if (businessTypesError) throw businessTypesError;
        setBusinessTypes(businessTypesData || []);

        // Fetch industries
        const { data: industriesData, error: industriesError } = await supabase
          .from('business_industries')
          .select('*');

        if (industriesError) throw industriesError;
        setIndustries(industriesData || []);

        // Fetch payment methods
        const { data: paymentMethodsData, error: paymentMethodsError } = await supabase
          .from('payment_methods_options')
          .select('*');

        if (paymentMethodsError) throw paymentMethodsError;
        setPaymentMethods(paymentMethodsData || []);
      } catch (err) {
        console.error('Error fetching business constants:', err);
        setError('Failed to load business constants');
      } finally {
        setLoading(false);
      }
    }

    fetchBusinessConstants();
  }, []);

  // Format options for select components
  const businessTypeOptions = businessTypes.map(type => ({
    value: type.value,
    label: type.label // Use label instead of name
  }));

  const industryOptions = industries.map(industry => ({
    value: industry.value,
    label: industry.label // Use label instead of name
  }));

  const paymentMethodOptions = paymentMethods.map(method => ({
    value: method.value,
    label: method.label // Use label instead of name
  }));

  return {
    businessTypeOptions,
    industryOptions,
    paymentMethodOptions,
    loading,
    error
  };
}
