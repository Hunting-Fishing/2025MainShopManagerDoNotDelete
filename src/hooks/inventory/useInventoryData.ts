
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { getInventoryItems } from '@/services/inventory/crudService';
import { 
  getInventoryCategories, 
  getInventorySuppliers, 
  getInventoryLocations,
  getInventoryStatuses
} from '@/services/inventory/filterService';
import { InventoryItemExtended } from '@/types/inventory';

/**
 * Centralized inventory data hook that provides all inventory-related data
 * Eliminates duplicate API calls and provides efficient caching
 */
export function useInventoryData() {
  // Main inventory items query with optimized caching
  const {
    data: items = [],
    isLoading: itemsLoading,
    error: itemsError,
    refetch: refetchItems
  } = useQuery({
    queryKey: ['inventory-items'],
    queryFn: async () => {
      console.log('🔄 useInventoryData: Fetching inventory items...');
      const result = await getInventoryItems();
      console.log('✅ useInventoryData: Successfully fetched', result?.length || 0, 'items');
      return result || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Filter options queries - only fetch if we have items
  const {
    data: filterOptions,
    isLoading: filtersLoading
  } = useQuery({
    queryKey: ['inventory-filter-options'],
    queryFn: async () => {
      console.log('🔄 useInventoryData: Fetching filter options...');
      const [categories, suppliers, locations, statuses] = await Promise.all([
        getInventoryCategories(),
        getInventorySuppliers(),
        getInventoryLocations(),
        getInventoryStatuses()
      ]);
      
      return {
        categories,
        suppliers,
        locations,
        statuses
      };
    },
    enabled: items.length > 0, // Only fetch if we have items
    staleTime: 10 * 60 * 1000, // 10 minutes - filter options change less frequently
  });

  // Memoized filter options with fallbacks
  const memoizedFilterOptions = useMemo(() => ({
    categories: filterOptions?.categories || [],
    suppliers: filterOptions?.suppliers || [],
    locations: filterOptions?.locations || [],
    statuses: filterOptions?.statuses || ['active', 'inactive', 'in stock', 'low stock', 'out of stock', 'discontinued']
  }), [filterOptions]);

  // Memoized inventory statistics
  const inventoryStats = useMemo(() => {
    if (!items.length) {
      return {
        totalItems: 0,
        totalValue: 0,
        lowStockCount: 0,
        outOfStockCount: 0
      };
    }

    const totalItems = items.length;
    const totalValue = items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
    const lowStockCount = items.filter(item => {
      const quantity = Number(item.quantity) || 0;
      const reorderPoint = Number(item.reorder_point) || 0;
      return quantity > 0 && quantity <= reorderPoint;
    }).length;
    const outOfStockCount = items.filter(item => (Number(item.quantity) || 0) <= 0).length;

    return {
      totalItems,
      totalValue,
      lowStockCount,
      outOfStockCount
    };
  }, [items]);

  const isLoading = itemsLoading || filtersLoading;
  const error = itemsError?.message || null;

  return {
    // Data
    items,
    filterOptions: memoizedFilterOptions,
    inventoryStats,
    
    // Loading/Error states
    isLoading,
    error,
    
    // Actions
    refetch: refetchItems
  };
}
