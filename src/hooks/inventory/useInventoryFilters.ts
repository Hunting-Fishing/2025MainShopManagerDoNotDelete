
import { useState, useEffect } from 'react';

export function useInventoryFilters() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [supplierFilter, setSupplierFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Initialize filters
  useEffect(() => {
    // Simulate loading of filter options
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Reset all filters
  const resetFilters = () => {
    setSearchQuery('');
    setCategoryFilter([]);
    setStatusFilter([]);
    setSupplierFilter('');
    setLocationFilter('');
  };
  
  // Update a specific filter by key
  const updateFilter = (
    key: 'status' | 'category' | 'supplier' | 'location' | 'searchQuery' | 'stockLevel' | 'priceRange',
    value: string | string[] | { min: number; max: number }
  ) => {
    switch (key) {
      case 'searchQuery':
        if (typeof value === 'string') setSearchQuery(value);
        break;
      case 'category':
        if (Array.isArray(value)) setCategoryFilter(value);
        break;
      case 'status':
        if (Array.isArray(value)) setStatusFilter(value);
        break;
      case 'supplier':
        if (typeof value === 'string') setSupplierFilter(value);
        break;
      case 'location':
        if (typeof value === 'string') setLocationFilter(value);
        break;
      default:
        console.warn(`Unknown filter key: ${key}`);
    }
  };
  
  return {
    // Filter state
    searchQuery,
    categoryFilter,
    statusFilter,
    supplierFilter,
    locationFilter,
    loading,
    error,
    
    // Filter setters
    setSearchQuery,
    setCategoryFilter,
    setStatusFilter,
    setSupplierFilter,
    setLocationFilter,
    
    // Filter actions
    resetFilters,
    updateFilter,
    
    // Current filters object for consumption by other components
    filters: {
      searchQuery,
      category: categoryFilter.join(','),
      status: statusFilter.join(','),
      location: locationFilter,
      supplier: supplierFilter,
      stockLevel: '',
      priceRange: { min: 0, max: 0 }
    }
  };
}
