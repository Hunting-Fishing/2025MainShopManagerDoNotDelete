
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAllCustomers } from '@/services/customers/crudService';
import { Customer } from '@/types/customer';

/**
 * PROTECTED HOOK - Customer management functionality
 * This hook provides full customer data management
 * DO NOT replace with mock data or remove functionality
 */

interface CustomerFilters {
  search: string;
  segment: string;
  hasVehicles: boolean | null;
  vehicleType: string;
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
}

const defaultFilters: CustomerFilters = {
  search: '',
  segment: '',
  hasVehicles: null,
  vehicleType: '',
  dateRange: {
    from: null,
    to: null,
  },
};

export function useCustomers() {
  console.log('🔄 useCustomers: Hook initialized');
  
  const [filters, setFilters] = useState<CustomerFilters>(defaultFilters);

  const {
    data: customers = [],
    isLoading: loading,
    error,
    refetch
  } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      console.log('🔄 useCustomers: Fetching customers...');
      const result = await getAllCustomers();
      console.log('✅ useCustomers: Successfully fetched', result?.length || 0, 'customers');
      console.log('📊 useCustomers: Customer data sample:', result?.slice(0, 2));
      return result || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Filter customers based on current filters
  const filteredCustomers = customers.filter((customer: Customer) => {
    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const customerName = `${customer.first_name} ${customer.last_name}`.toLowerCase();
      const email = customer.email?.toLowerCase() || '';
      const phone = customer.phone?.toLowerCase() || '';
      
      if (!customerName.includes(searchTerm) && 
          !email.includes(searchTerm) && 
          !phone.includes(searchTerm)) {
        return false;
      }
    }

    // Segment filter
    if (filters.segment && customer.segments) {
      const segments = Array.isArray(customer.segments) ? customer.segments : [];
      if (!segments.includes(filters.segment)) {
        return false;
      }
    }

    return true;
  });

  const handleFilterChange = (newFilters: Partial<CustomerFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters(defaultFilters);
  };

  return {
    customers,
    filteredCustomers,
    loading,
    error: error?.message || null,
    filters,
    handleFilterChange,
    clearFilters,
    refetch,
  };
}
