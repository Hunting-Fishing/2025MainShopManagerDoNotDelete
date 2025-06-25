
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAllCustomers } from '@/services/customer/customerQueryService';
import { Customer } from '@/types/customer';

/**
 * PROTECTED HOOK - Customer management functionality
 * This hook provides full customer data management
 * DO NOT replace with mock data or remove functionality
 */

interface CustomerFilters {
  search?: string;
  searchQuery?: string;
  status?: string;
  sortBy?: string;
  tags?: string[];
  vehicleType?: string;
  hasVehicles?: string;
  dateRange?: {
    from: Date | null;
    to: Date | null;
  };
}

const defaultFilters: CustomerFilters = {
  search: '',
  searchQuery: '',
  status: 'all',
  sortBy: 'name',
  tags: [],
  vehicleType: '',
  hasVehicles: '',
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

    // Has vehicles filter
    if (filters.hasVehicles && filters.hasVehicles !== '') {
      const hasVehicles = (customer.vehicles?.length || 0) > 0;
      if (filters.hasVehicles === 'yes' && !hasVehicles) {
        return false;
      }
      if (filters.hasVehicles === 'no' && hasVehicles) {
        return false;
      }
    }

    return true;
  });

  const handleFilterChange = (newFilters: CustomerFilters) => {
    setFilters(newFilters);
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
