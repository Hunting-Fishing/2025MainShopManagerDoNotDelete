
import { useState, useEffect } from 'react';
import { businessConstantsService, type BusinessConstant } from '@/services/unified/businessConstantsService';

export { type BusinessConstant };

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
      const constants = await businessConstantsService.getBusinessConstants();
      
      setBusinessTypes(constants.businessTypes);
      setBusinessIndustries(constants.industries);
      setPaymentMethods(constants.paymentMethods);
    } catch (err: any) {
      console.error('Error fetching business constants:', err);
      setError(err.message || 'Failed to load business constants');
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
