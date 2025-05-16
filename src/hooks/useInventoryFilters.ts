
import { useState, useMemo } from 'react';
import { InventoryItemExtended } from '@/types/inventory';

export interface InventoryFilters {
  search: string;
  category: string;
  status: string;
  supplier: string;
  minPrice: number | '';
  maxPrice: number | '';
  inStockOnly: boolean;
  lowStockOnly: boolean;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export function useInventoryFilters(items: InventoryItemExtended[] = []) {
  const [filters, setFilters] = useState<InventoryFilters>({
    search: '',
    category: '',
    status: '',
    supplier: '',
    minPrice: '',
    maxPrice: '',
    inStockOnly: false,
    lowStockOnly: false,
    sortBy: 'name',
    sortOrder: 'asc',
  });

  const categories = useMemo(() => {
    const categorySet = new Set<string>();
    items.forEach(item => {
      if (item.category) {
        categorySet.add(item.category);
      }
    });
    return Array.from(categorySet).sort();
  }, [items]);

  const suppliers = useMemo(() => {
    const supplierSet = new Set<string>();
    items.forEach(item => {
      if (item.supplier) {
        supplierSet.add(item.supplier);
      }
    });
    return Array.from(supplierSet).sort();
  }, [items]);

  const statuses = useMemo(() => {
    const statusSet = new Set<string>();
    items.forEach(item => {
      if (item.status) {
        statusSet.add(item.status);
      }
    });
    return Array.from(statusSet).sort();
  }, [items]);

  const updateFilter = (key: keyof InventoryFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      category: '',
      status: '',
      supplier: '',
      minPrice: '',
      maxPrice: '',
      inStockOnly: false,
      lowStockOnly: false,
      sortBy: 'name',
      sortOrder: 'asc',
    });
  };

  const sortItems = (a: InventoryItemExtended, b: InventoryItemExtended) => {
    const { sortBy, sortOrder } = filters;
    
    // Handle different sort fields
    let valueA, valueB;
    
    switch (sortBy) {
      case 'name':
        valueA = a.name.toLowerCase();
        valueB = b.name.toLowerCase();
        break;
      case 'sku':
        valueA = a.sku.toLowerCase();
        valueB = b.sku.toLowerCase();
        break;
      case 'quantity':
        valueA = a.quantity;
        valueB = b.quantity;
        break;
      case 'price':
        valueA = a.unit_price;
        valueB = b.unit_price;
        break;
      case 'category':
        valueA = a.category?.toLowerCase() || '';
        valueB = b.category?.toLowerCase() || '';
        break;
      case 'supplier':
        valueA = a.supplier?.toLowerCase() || '';
        valueB = b.supplier?.toLowerCase() || '';
        break;
      default:
        valueA = a.name.toLowerCase();
        valueB = b.name.toLowerCase();
    }
    
    // Apply sort direction
    if (sortOrder === 'asc') {
      return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
    } else {
      return valueA < valueB ? 1 : valueA > valueB ? -1 : 0;
    }
  };

  const filteredItems = useMemo(() => {
    return items
      .filter(item => {
        // Search filter
        if (
          filters.search &&
          !item.name.toLowerCase().includes(filters.search.toLowerCase()) &&
          !item.sku.toLowerCase().includes(filters.search.toLowerCase()) &&
          !(item.description?.toLowerCase() || '').includes(filters.search.toLowerCase())
        ) {
          return false;
        }
        
        // Category filter
        if (filters.category && item.category !== filters.category) {
          return false;
        }
        
        // Status filter
        if (filters.status && item.status !== filters.status) {
          return false;
        }
        
        // Supplier filter
        if (filters.supplier && item.supplier !== filters.supplier) {
          return false;
        }
        
        // Price range filters
        if (filters.minPrice !== '' && item.unit_price < filters.minPrice) {
          return false;
        }
        
        if (filters.maxPrice !== '' && item.unit_price > filters.maxPrice) {
          return false;
        }
        
        // In-stock only filter
        if (filters.inStockOnly && item.quantity <= 0) {
          return false;
        }
        
        // Low-stock only filter
        if (filters.lowStockOnly && item.quantity > item.reorder_point) {
          return false;
        }
        
        return true;
      })
      .sort(sortItems);
  }, [items, filters]);

  return {
    filters,
    updateFilter,
    resetFilters,
    filteredItems,
    categories,
    suppliers,
    statuses,
    totalItems: items.length,
    filteredItemsCount: filteredItems.length
  };
}
