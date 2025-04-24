
import { useState, useEffect, useCallback } from 'react';
import { Customer } from '@/types/customer';
import { CustomerFilters } from '@/components/customers/filters/CustomerFilterControls';
import { getAllCustomers } from '@/services/customers/customerCrudService';

export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [filters, setFilters] = useState<CustomerFilters>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionOk, setConnectionOk] = useState<boolean | null>(null);

  const applyFilters = useCallback((customerList: Customer[], currentFilters: CustomerFilters) => {
    // Ensure currentFilters is never null or undefined
    const safeFilters = currentFilters || {};
    
    // Start with all customers
    let result = [...customerList];

    // Apply search filter
    if (safeFilters.search && safeFilters.search.trim() !== '') {
      const searchTerm = safeFilters.search.toLowerCase().trim();
      result = result.filter((customer) => {
        const fullName = `${customer.first_name} ${customer.last_name}`.toLowerCase();
        const email = customer.email ? customer.email.toLowerCase() : '';
        const phone = customer.phone ? customer.phone.toLowerCase() : '';
        
        return (
          fullName.includes(searchTerm) || 
          email.includes(searchTerm) || 
          phone.includes(searchTerm)
        );
      });
    }

    // Apply hasVehicles filter
    if (safeFilters.hasVehicles) {
      result = result.filter((customer) => 
        customer.vehicles && customer.vehicles.length > 0
      );
    }

    // Apply noVehicles filter
    if (safeFilters.noVehicles) {
      result = result.filter((customer) => 
        !customer.vehicles || customer.vehicles.length === 0
      );
    }

    // Apply status filter
    if (safeFilters.status) {
      result = result.filter((customer) => 
        customer.status === safeFilters.status
      );
    }

    // Apply date range filters if provided
    if (safeFilters.dateFrom || safeFilters.dateTo) {
      result = result.filter((customer) => {
        const customerDate = new Date(customer.created_at);
        
        // Check if date is after dateFrom
        if (safeFilters.dateFrom && customerDate < safeFilters.dateFrom) {
          return false;
        }
        
        // Check if date is before dateTo
        if (safeFilters.dateTo) {
          const endDate = new Date(safeFilters.dateTo);
          endDate.setHours(23, 59, 59, 999); // End of day
          if (customerDate > endDate) {
            return false;
          }
        }
        
        return true;
      });
    }

    // Apply tag filters if provided
    if (safeFilters.tags && safeFilters.tags.length > 0) {
      result = result.filter((customer) => {
        if (!customer.tags) return false;
        
        // Check if customer has at least one of the selected tags
        return safeFilters.tags!.some((tag) => 
          customer.tags!.includes(tag)
        );
      });
    }

    // Apply segment filter
    if (safeFilters.segment) {
      result = result.filter((customer) => {
        if (!customer.segments) return false;
        return customer.segments.includes(safeFilters.segment!);
      });
    }

    // Apply sorting if provided
    if (safeFilters.sortBy) {
      result.sort((a, b) => {
        let valueA: any;
        let valueB: any;
        
        // Handle different sort fields
        switch (safeFilters.sortBy) {
          case 'name':
            valueA = `${a.last_name} ${a.first_name}`.toLowerCase();
            valueB = `${b.last_name} ${b.first_name}`.toLowerCase();
            break;
          case 'email':
            valueA = (a.email || '').toLowerCase();
            valueB = (b.email || '').toLowerCase();
            break;
          case 'date':
            valueA = new Date(a.created_at).getTime();
            valueB = new Date(b.created_at).getTime();
            break;
          default:
            valueA = a[safeFilters.sortBy as keyof Customer] || '';
            valueB = b[safeFilters.sortBy as keyof Customer] || '';
        }
        
        // Handle sorting direction
        const direction = safeFilters.sortDirection === 'desc' ? -1 : 1;
        
        if (valueA < valueB) return -1 * direction;
        if (valueA > valueB) return 1 * direction;
        return 0;
      });
    }

    return result;
  }, []);

  // Load customers
  const loadCustomers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await getAllCustomers();
      setCustomers(data);
      setFilteredCustomers(applyFilters(data, filters));
      setConnectionOk(true);
    } catch (err: any) {
      console.error("Error loading customers:", err);
      setError(err.message || "Failed to load customers");
      setConnectionOk(false);
    } finally {
      setLoading(false);
    }
  }, [filters, applyFilters]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  // Update filtered customers when filters change
  useEffect(() => {
    setFilteredCustomers(applyFilters(customers, filters));
  }, [filters, customers, applyFilters]);

  const handleFilterChange = (newFilters: CustomerFilters) => {
    setFilters({...filters, ...newFilters});
  };

  const refreshCustomers = () => {
    loadCustomers();
  };

  return {
    customers,
    filteredCustomers,
    filters,
    loading,
    error,
    connectionOk,
    handleFilterChange,
    refreshCustomers
  };
};
