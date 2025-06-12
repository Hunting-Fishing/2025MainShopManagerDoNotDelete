
import { useState, useEffect } from 'react';
import { Customer } from '@/types/customer';
import { getAllCustomers } from '@/services/customer/customerQueryService';
import { handleApiError } from '@/utils/errorHandling';

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
    applyFilters();
  }, [customers, filters]);

  const fetchCustomers = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Fetching customers from database...');
      const data = await getAllCustomers();
      console.log('✅ Customers fetched successfully:', data?.length || 0, 'customers');
      
      if (data && Array.isArray(data)) {
        setCustomers(data);
        console.log('📊 Customer data sample:', data.slice(0, 2));
      } else {
        console.warn('⚠️ No customer data received or invalid format');
        setCustomers([]);
      }
    } catch (err) {
      console.error('❌ Error fetching customers:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch customers';
      setError(errorMessage);
      setCustomers([]);
      
      // Use centralized error handling
      handleApiError(err, 'Failed to load customers');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    if (!customers || !Array.isArray(customers)) {
      console.log('🔍 No customers to filter');
      setFilteredCustomers([]);
      return;
    }

    let filtered = [...customers];
    console.log('🔍 Applying filters to', filtered.length, 'customers');

    // Apply search filter
    if (filters.search && filters.search.trim()) {
      const searchTerm = filters.search.toLowerCase().trim();
      filtered = filtered.filter(customer => {
        const searchableFields = [
          customer.first_name,
          customer.last_name,
          customer.email,
          customer.phone,
          customer.company
        ].filter(Boolean);
        
        return searchableFields.some(field => 
          field?.toLowerCase().includes(searchTerm)
        );
      });
      console.log('🔍 After search filter:', filtered.length, 'customers');
    }

    // Apply sorting
    if (filters.sortBy === 'name') {
      filtered.sort((a, b) => {
        const nameA = `${a.last_name || ''} ${a.first_name || ''}`.trim();
        const nameB = `${b.last_name || ''} ${b.first_name || ''}`.trim();
        return nameA.localeCompare(nameB);
      });
    }

    console.log('✅ Final filtered customers:', filtered.length);
    setFilteredCustomers(filtered);
  };

  const handleFilterChange = (newFilters: Partial<CustomerFilters>) => {
    console.log('🔧 Filter change:', newFilters);
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
