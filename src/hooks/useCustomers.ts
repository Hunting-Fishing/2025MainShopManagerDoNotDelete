
import { useState, useEffect, useMemo } from 'react';
import { Customer } from '@/types/customer';
import { getAllCustomers } from '@/services/customer';
import { useToast } from '@/hooks/use-toast';

export interface CustomerFilters {
  search?: string;
  searchQuery?: string;
  status?: string;
  sortBy?: string;
}

export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<CustomerFilters>({
    search: '',
    searchQuery: '',
    status: 'all',
    sortBy: 'name'
  });
  const { toast } = useToast();

  // Fetch customers on mount
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching customers...');
        
        const customersData = await getAllCustomers();
        console.log('Customers fetched:', customersData);
        
        setCustomers(customersData || []);
      } catch (err) {
        console.error('Error fetching customers:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load customers';
        setError(errorMessage);
        toast({
          title: "Error",
          description: "Failed to load customers. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [toast]);

  // Filter and sort customers
  const filteredCustomers = useMemo(() => {
    let filtered = [...customers];

    // Apply search filter
    if (filters.search || filters.searchQuery) {
      const searchTerm = (filters.search || filters.searchQuery || '').toLowerCase().trim();
      if (searchTerm) {
        filtered = filtered.filter(customer => {
          const fullName = `${customer.first_name || ''} ${customer.last_name || ''}`.toLowerCase();
          const email = (customer.email || '').toLowerCase();
          const phone = (customer.phone || '').toLowerCase();
          const company = (customer.company || '').toLowerCase();
          
          return fullName.includes(searchTerm) ||
                 email.includes(searchTerm) ||
                 phone.includes(searchTerm) ||
                 company.includes(searchTerm);
        });
      }
    }

    // Apply sorting
    if (filters.sortBy) {
      filtered.sort((a, b) => {
        switch (filters.sortBy) {
          case 'name':
            const nameA = `${a.first_name || ''} ${a.last_name || ''}`.trim();
            const nameB = `${b.first_name || ''} ${b.last_name || ''}`.trim();
            return nameA.localeCompare(nameB);
          case 'email':
            return (a.email || '').localeCompare(b.email || '');
          case 'created':
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          default:
            return 0;
        }
      });
    }

    return filtered;
  }, [customers, filters]);

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
  };
};
