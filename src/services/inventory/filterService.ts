
import { supabase } from "@/integrations/supabase/client";
import { InventoryItemExtended } from "@/types/inventory";
import { getInventorySuppliers } from "./supplierService";
import { getInventoryCategories } from "./categoryService";

/**
 * Filter inventory items based on search criteria
 */
export const filterInventoryItems = (
  items: InventoryItemExtended[],
  filters: {
    search?: string;
    category?: string;
    status?: string;
    supplier?: string;
    location?: string;
  }
): InventoryItemExtended[] => {
  return items.filter((item) => {
    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const matchesSearch = 
        item.name.toLowerCase().includes(searchTerm) ||
        item.sku.toLowerCase().includes(searchTerm) ||
        (item.description && item.description.toLowerCase().includes(searchTerm));
      
      if (!matchesSearch) return false;
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
    
    // Location filter
    if (filters.location && item.location !== filters.location) {
      return false;
    }
    
    return true;
  });
};

/**
 * Get unique categories from database
 */
export const getInventoryFilters = async () => {
  try {
    const [categories, suppliers] = await Promise.all([
      getInventoryCategories(),
      getInventorySuppliers()
    ]);
    
    return {
      categories,
      suppliers,
      statuses: ['active', 'inactive', 'in stock', 'low stock', 'out of stock', 'discontinued'],
      locations: [] // Will be populated from actual data
    };
  } catch (error) {
    console.error('Error fetching inventory filters:', error);
    return {
      categories: [],
      suppliers: [],
      statuses: [],
      locations: []
    };
  }
};

/**
 * Get inventory categories (alias for compatibility)
 */
export { getInventoryCategories };

/**
 * Get inventory suppliers (alias for compatibility)
 */
export { getInventorySuppliers };

/**
 * Get unique locations from inventory items
 */
export const getInventoryLocations = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('location')
      .not('location', 'is', null)
      .not('location', 'eq', '');
      
    if (error) throw error;
    
    const uniqueLocations = [...new Set(
      data?.map(item => item.location).filter(Boolean) || []
    )].sort();
    
    return uniqueLocations;
  } catch (error) {
    console.error('Error fetching inventory locations:', error);
    return [];
  }
};

/**
 * Get unique statuses from inventory items
 */
export const getInventoryStatuses = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('status')
      .not('status', 'is', null)
      .not('status', 'eq', '');
      
    if (error) throw error;
    
    const uniqueStatuses = [...new Set(
      data?.map(item => item.status).filter(Boolean) || []
    )].sort();
    
    return uniqueStatuses;
  } catch (error) {
    console.error('Error fetching inventory statuses:', error);
    return ['active', 'inactive', 'in stock', 'low stock', 'out of stock', 'discontinued'];
  }
};
