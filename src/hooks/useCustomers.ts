
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

export interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  company?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CustomerFilters {
  search: string;
  status: string;
  sortBy: string;
}

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<CustomerFilters>({
    search: '',
    status: 'all',
    sortBy: 'name'
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('last_name', { ascending: true });

      if (error) throw error;
      
      setCustomers(data || []);
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error",
        description: "Failed to load customers",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const searchTerm = filters.search.toLowerCase();
    const matchesSearch = !searchTerm || 
      customer.first_name.toLowerCase().includes(searchTerm) ||
      customer.last_name.toLowerCase().includes(searchTerm) ||
      customer.email?.toLowerCase().includes(searchTerm) ||
      customer.company?.toLowerCase().includes(searchTerm);

    return matchesSearch;
  });

  const handleFilterChange = (newFilters: Partial<CustomerFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  return {
    customers,
    filteredCustomers,
    loading,
    error,
    filters,
    handleFilterChange,
    refetch: fetchCustomers
  };
}
