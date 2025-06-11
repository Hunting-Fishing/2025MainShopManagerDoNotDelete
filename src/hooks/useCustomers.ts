
import { useState, useEffect } from 'react';
import { Customer } from '@/types/customer';
import { getAllCustomers } from '@/services/customer/customerQueryService';

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await getAllCustomers();
      setCustomers(data);
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      setCustomers([]); // No fallback data - use real data only
    } finally {
      setIsLoading(false);
    }
  };

  return {
    customers,
    isLoading,
    error,
    refetch: fetchCustomers
  };
}
