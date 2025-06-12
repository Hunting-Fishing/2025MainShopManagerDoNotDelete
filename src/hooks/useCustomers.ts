
import { useState, useEffect } from 'react';
import { Customer } from '@/types/customer';
import { getAllCustomers } from '@/services/customer/customerQueryService';

export interface CustomerFilters {
  search?: string;
  searchQuery?: string;
  status?: string;
  sortBy?: string;
}

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<CustomerFilters>({
    search: '',
    searchQuery: '',
    status: 'all',
    sortBy: 'name'
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    // Apply filters whenever customers or filters change
    applyFilters();
  }, [customers, filters]);

  const fetchCustomers = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Fetching customers...');
      const data = await getAllCustomers();
      console.log('Customers fetched successfully:', data);
      setCustomers(data || []);
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      setCustomers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...customers];

    // Apply search filter
    if (filters.search && filters.search.trim()) {
      const searchTerm = filters.search.toLowerCase().trim();
      filtered = filtered.filter(customer => 
        customer.first_name?.toLowerCase().includes(searchTerm) ||
        customer.last_name?.toLowerCase().includes(searchTerm) ||
        customer.email?.toLowerCase().includes(searchTerm) ||
        customer.phone?.toLowerCase().includes(searchTerm) ||
        customer.company?.toLowerCase().includes(searchTerm)
      );
    }

    // Apply sorting
    if (filters.sortBy === 'name') {
      filtered.sort((a, b) => {
        const nameA = `${a.last_name || ''} ${a.first_name || ''}`.trim();
        const nameB = `${b.last_name || ''} ${b.first_name || ''}`.trim();
        return nameA.localeCompare(nameB);
      });
    }

    console.log('Filtered customers:', filtered);
    setFilteredCustomers(filtered);
  };

  const handleFilterChange = (newFilters: CustomerFilters) => {
    console.log('Filter change:', newFilters);
    setFilters(prevFilters => ({
      ...prevFilters,
      ...newFilters
    }));
  };

  return {
    customers,
    filteredCustomers,
    loading: isLoading,
    isLoading,
    error,
    filters,
    handleFilterChange,
    refetch: fetchCustomers
  };
}
