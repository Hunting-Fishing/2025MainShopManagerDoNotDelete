
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
      // Since the actual tables don't exist yet, create mock data
      // In a real implementation, these would come from separate database tables
      
      // Mock business types
      const mockBusinessTypes: BusinessConstant[] = [
        { value: 'sole_proprietorship', label: 'Sole Proprietorship' },
        { value: 'partnership', label: 'Partnership' },
        { value: 'llc', label: 'Limited Liability Company (LLC)' },
        { value: 'corporation', label: 'Corporation' },
        { value: 's_corporation', label: 'S Corporation' },
        { value: 'nonprofit', label: 'Nonprofit Organization' }
      ];
      setBusinessTypes(mockBusinessTypes);
      
      // Mock business industries
      const mockBusinessIndustries: BusinessConstant[] = [
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
      setBusinessIndustries(mockBusinessIndustries);
      
      // Mock payment methods
      const mockPaymentMethods: BusinessConstant[] = [
        { value: 'cash', label: 'Cash' },
        { value: 'check', label: 'Check' },
        { value: 'credit_card', label: 'Credit Card' },
        { value: 'debit_card', label: 'Debit Card' },
        { value: 'bank_transfer', label: 'Bank Transfer' },
        { value: 'paypal', label: 'PayPal' },
        { value: 'venmo', label: 'Venmo' },
        { value: 'apple_pay', label: 'Apple Pay' },
        { value: 'google_pay', label: 'Google Pay' },
        { value: 'cryptocurrency', label: 'Cryptocurrency' }
      ];
      setPaymentMethods(mockPaymentMethods);
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
