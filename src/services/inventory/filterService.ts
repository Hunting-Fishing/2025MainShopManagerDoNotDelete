import { InventoryItemExtended, InventoryFilter } from "@/types/inventory";
import { getInventoryItems } from "./crudService";

/**
 * Filter inventory items based on provided criteria
 */
export const filterInventoryItems = async (filter: InventoryFilter): Promise<InventoryItemExtended[]> => {
  try {
    const allItems = await getInventoryItems();
    
    return allItems.filter(item => {
      // Search filter
      if (filter.search) {
        const searchLower = filter.search.toLowerCase();
        const matchesSearch = 
          item.name.toLowerCase().includes(searchLower) ||
          item.sku.toLowerCase().includes(searchLower) ||
          (item.description && item.description.toLowerCase().includes(searchLower));
        
        if (!matchesSearch) return false;
      }
      
      // Category filter
      if (filter.category && filter.category.length > 0) {
        if (!filter.category.includes(item.category || '')) return false;
      }
      
      // Status filter
      if (filter.status && filter.status.length > 0) {
        if (!filter.status.includes(item.status)) return false;
      }
      
      // Supplier filter
      if (filter.supplier) {
        if (item.supplier !== filter.supplier) return false;
      }
      
      // Location filter
      if (filter.location) {
        if (item.location !== filter.location) return false;
      }
      
      // Stock level filter
      if (filter.stockLevel) {
        const quantity = Number(item.quantity) || 0;
        const reorderPoint = Number(item.reorder_point) || 0;
        
        switch (filter.stockLevel) {
          case 'out':
            if (quantity > 0) return false;
            break;
          case 'low':
            if (quantity <= 0 || quantity > reorderPoint) return false;
            break;
          case 'in':
            if (quantity <= reorderPoint) return false;
            break;
        }
      }
      
      // Price range filter
      if (filter.priceRange) {
        const price = Number(item.unit_price) || 0;
        
        if (filter.priceRange.min !== undefined && price < filter.priceRange.min) return false;
        if (filter.priceRange.max !== undefined && price > filter.priceRange.max) return false;
      }
      
      return true;
    });
  } catch (error) {
    console.error('Error filtering inventory items:', error);
    return [];
  }
};

/**
 * Get available filter options from inventory data
 */
export const getFilterOptions = async () => {
  try {
    const allItems = await getInventoryItems();
    
    const categories = [...new Set(allItems.map(item => item.category).filter(Boolean))];
    const suppliers = [...new Set(allItems.map(item => item.supplier).filter(Boolean))];
    const locations = [...new Set(allItems.map(item => item.location).filter(Boolean))];
    const statuses = [...new Set(allItems.map(item => item.status).filter(Boolean))];
    
    return {
      categories,
      suppliers,
      locations,
      statuses
    };
  } catch (error) {
    console.error('Error getting filter options:', error);
    return {
      categories: [],
      suppliers: [],
      locations: [],
      statuses: []
    };
  }
};

/**
 * Get inventory categories
 */
export const getInventoryCategories = async (): Promise<string[]> => {
  try {
    const allItems = await getInventoryItems();
    return [...new Set(allItems.map(item => item.category).filter(Boolean))];
  } catch (error) {
    console.error('Error getting inventory categories:', error);
    return [];
  }
};

/**
 * Get inventory suppliers
 */
export const getInventorySuppliers = async (): Promise<string[]> => {
  try {
    const allItems = await getInventoryItems();
    return [...new Set(allItems.map(item => item.supplier).filter(Boolean))];
  } catch (error) {
    console.error('Error getting inventory suppliers:', error);
    return [];
  }
};

/**
 * Get inventory locations
 */
export const getInventoryLocations = async (): Promise<string[]> => {
  try {
    const allItems = await getInventoryItems();
    return [...new Set(allItems.map(item => item.location).filter(Boolean))];
  } catch (error) {
    console.error('Error getting inventory locations:', error);
    return [];
  }
};

/**
 * Get inventory statuses
 */
export const getInventoryStatuses = async (): Promise<string[]> => {
  try {
    const allItems = await getInventoryItems();
    return [...new Set(allItems.map(item => item.status).filter(Boolean))];
  } catch (error) {
    console.error('Error getting inventory statuses:', error);
    return [];
  }
};
