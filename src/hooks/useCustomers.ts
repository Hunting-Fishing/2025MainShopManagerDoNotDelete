
import { useState, useEffect } from 'react';
import { Customer } from '@/types/customer';
import { getAllCustomers } from '@/services/customer/customerQueryService';
import { handleApiError } from '@/utils/errorHandling';
import { DateRange } from 'react-day-picker';

export interface CustomerFilters {
  search?: string;
  searchQuery?: string;
  status?: string;
  sortBy?: string;
  tags?: string[];
  vehicleType?: string;
  hasVehicles?: string;
  dateRange?: DateRange;
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
    sortBy: 'name',
    tags: [],
    vehicleType: '',
    hasVehicles: '',
    dateRange: undefined
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [customers, filters]);

  const fetchCustomers = async () => {
    console.log('🔄 useCustomers: Starting to fetch customers...');
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await getAllCustomers();
      console.log('✅ useCustomers: Successfully fetched', data?.length || 0, 'customers');
      
      if (Array.isArray(data)) {
        setCustomers(data);
        console.log('📊 useCustomers: Customer data sample:', data.slice(0, 2));
      } else {
        console.warn('⚠️ useCustomers: Invalid data format received');
        setCustomers([]);
      }
    } catch (err) {
      console.error('❌ useCustomers: Error fetching customers:', err);
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
      console.log('🔍 useCustomers: No customers to filter');
      setFilteredCustomers([]);
      return;
    }

    let filtered = [...customers];
    console.log('🔍 useCustomers: Applying filters to', filtered.length, 'customers');

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
      console.log('🔍 useCustomers: After search filter:', filtered.length, 'customers');
    }

    // Apply tags filter
    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter(customer => {
        const customerTags = Array.isArray(customer.tags) ? customer.tags : [];
        return filters.tags!.some(tag => customerTags.includes(tag));
      });
      console.log('🔍 useCustomers: After tags filter:', filtered.length, 'customers');
    }

    // Apply vehicle type filter
    if (filters.vehicleType && filters.vehicleType !== '_any') {
      filtered = filtered.filter(customer => {
        const vehicles = customer.vehicles || [];
        return vehicles.some(vehicle => 
          vehicle.body_style?.toLowerCase() === filters.vehicleType?.toLowerCase()
        );
      });
      console.log('🔍 useCustomers: After vehicle type filter:', filtered.length, 'customers');
    }

    // Apply has vehicles filter
    if (filters.hasVehicles && filters.hasVehicles !== '_any') {
      filtered = filtered.filter(customer => {
        const hasVehicles = (customer.vehicles?.length || 0) > 0;
        if (filters.hasVehicles === 'yes') return hasVehicles;
        if (filters.hasVehicles === 'no') return !hasVehicles;
        return true;
      });
      console.log('🔍 useCustomers: After has vehicles filter:', filtered.length, 'customers');
    }

    // Apply date range filter
    if (filters.dateRange?.from || filters.dateRange?.to) {
      filtered = filtered.filter(customer => {
        const customerDate = new Date(customer.created_at);
        let inRange = true;
        
        if (filters.dateRange?.from) {
          inRange = inRange && customerDate >= filters.dateRange.from;
        }
        
        if (filters.dateRange?.to) {
          const endDate = new Date(filters.dateRange.to);
          endDate.setHours(23, 59, 59, 999);
          inRange = inRange && customerDate <= endDate;
        }
        
        return inRange;
      });
      console.log('🔍 useCustomers: After date range filter:', filtered.length, 'customers');
    }

    // Apply sorting
    if (filters.sortBy === 'name') {
      filtered.sort((a, b) => {
        const nameA = `${a.last_name || ''} ${a.first_name || ''}`.trim();
        const nameB = `${b.last_name || ''} ${b.first_name || ''}`.trim();
        return nameA.localeCompare(nameB);
      });
    }

    console.log('✅ useCustomers: Final filtered customers:', filtered.length);
    setFilteredCustomers(filtered);
  };

  const handleFilterChange = (newFilters: Partial<CustomerFilters>) => {
    console.log('🔧 useCustomers: Filter change:', newFilters);
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
