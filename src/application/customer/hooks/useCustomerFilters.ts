
import { useState, useMemo } from 'react';
import { CustomerEntity } from '@/domain/customer/entities/Customer';
import { CustomerFilters } from '@/domain/customer/repositories/CustomerRepository';

const defaultFilters: CustomerFilters = {
  search: '',
  hasVehicles: '',
  vehicleType: '',
  tags: [],
  dateRange: {
    from: null,
    to: null,
  },
};

export function useCustomerFilters(customers: CustomerEntity[]) {
  const [filters, setFilters] = useState<CustomerFilters>(defaultFilters);

  const filteredCustomers = useMemo(() => {
    let result = [...customers];

    // Search filter
    if (filters.search && filters.search.trim()) {
      const searchTerm = filters.search.trim().toLowerCase();
      result = result.filter(customer => customer.matchesSearch(searchTerm));
    }

    // Has vehicles filter
    if (filters.hasVehicles && filters.hasVehicles !== '') {
      result = result.filter(customer => {
        const hasVehicles = customer.hasVehicles();
        return filters.hasVehicles === 'yes' ? hasVehicles : !hasVehicles;
      });
    }

    // Date range filter
    if (filters.dateRange?.from || filters.dateRange?.to) {
      result = result.filter(customer => {
        const customerDate = new Date(customer.created_at);
        
        if (filters.dateRange?.from && customerDate < filters.dateRange.from) {
          return false;
        }
        
        if (filters.dateRange?.to && customerDate > filters.dateRange.to) {
          return false;
        }
        
        return true;
      });
    }

    return result;
  }, [customers, filters]);

  const handleFilterChange = (newFilters: Partial<CustomerFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters(defaultFilters);
  };

  return {
    filters,
    filteredCustomers,
    handleFilterChange,
    clearFilters,
  };
}
