
import { InventoryItemExtended } from "@/types/inventory";
import { supabase } from "@/lib/supabase";
import { formatInventoryItem } from "@/utils/inventory/inventoryUtils";

export const filterInventoryItems = async (filters: any = {}): Promise<InventoryItemExtended[]> => {
  try {
    let query = supabase.from('inventory_items').select('*');
    
    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,sku.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }
    
    if (filters.category && filters.category.length > 0) {
      query = query.in('category', filters.category);
    }
    
    if (filters.status && filters.status.length > 0) {
      query = query.in('status', filters.status);
    }
    
    if (filters.supplier) {
      query = query.eq('supplier', filters.supplier);
    }
    
    if (filters.location) {
      query = query.eq('location', filters.location);
    }
    
    if (filters.stockLevel === 'low') {
      // For low stock, get items where quantity > 0 and <= reorder_point
      query = query.gt('quantity', 0);
      // Note: We can't directly compare quantity to reorder_point in a single query
      // This is a simplification - in a real app we'd use a more sophisticated approach
    } else if (filters.stockLevel === 'out') {
      query = query.lte('quantity', 0);
    } else if (filters.stockLevel === 'in') {
      query = query.gt('quantity', 0);
    }
    
    if (filters.priceRange && filters.priceRange.min !== undefined) {
      query = query.gte('unit_price', filters.priceRange.min);
    }
    
    if (filters.priceRange && filters.priceRange.max !== undefined) {
      query = query.lte('unit_price', filters.priceRange.max);
    }
    
    const { data, error } = await query;
    
    if (error) {
      throw error;
    }
    
    let result = data.map(item => formatInventoryItem(item));
    
    // For low stock filter, apply the reorder point comparison client-side
    if (filters.stockLevel === 'low') {
      result = result.filter(item => item.quantity <= item.reorder_point);
    }
    
    return result;
  } catch (error) {
    console.error("Error filtering inventory items:", error);
    return [];
  }
};

export const getInventoryCategories = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('category')
      .not('category', 'is', null);
    
    if (error) {
      throw error;
    }
    
    return [...new Set(data.map(item => item.category).filter(Boolean))];
  } catch (error) {
    console.error("Error fetching inventory categories:", error);
    return [];
  }
};

export const getInventorySuppliers = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('supplier')
      .not('supplier', 'is', null);
    
    if (error) {
      throw error;
    }
    
    return [...new Set(data.map(item => item.supplier).filter(Boolean))];
  } catch (error) {
    console.error("Error fetching inventory suppliers:", error);
    return [];
  }
};

export const getInventoryLocations = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('location')
      .not('location', 'is', null);
    
    if (error) {
      throw error;
    }
    
    return [...new Set(data.map(item => item.location).filter(Boolean))];
  } catch (error) {
    console.error("Error fetching inventory locations:", error);
    return [];
  }
};

export const getInventoryStatuses = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('status')
      .not('status', 'is', null);
    
    if (error) {
      throw error;
    }
    
    return [...new Set(data.map(item => item.status).filter(Boolean))];
  } catch (error) {
    console.error("Error fetching inventory statuses:", error);
    return [];
  }
};

// Helper functions for inventory alerts
export const getLowStockItems = async (): Promise<InventoryItemExtended[]> => {
  try {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*');
    
    if (error) {
      throw error;
    }
    
    return data
      .filter(item => {
        const quantity = Number(item.quantity) || 0;
        const reorderPoint = Number(item.reorder_point) || 0;
        return quantity > 0 && quantity <= reorderPoint;
      })
      .map(formatInventoryItem);
  } catch (error) {
    console.error("Error fetching low stock items:", error);
    return [];
  }
};

export const getOutOfStockItems = async (): Promise<InventoryItemExtended[]> => {
  try {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .lte('quantity', 0);
    
    if (error) {
      throw error;
    }
    
    return data.map(formatInventoryItem);
  } catch (error) {
    console.error("Error fetching out of stock items:", error);
    return [];
  }
};

// Custom query functionality without using raw SQL
export const executeCustomQuery = async (stockLevel: 'low' | 'out' | 'all'): Promise<InventoryItemExtended[]> => {
  try {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*');
      
    if (error) {
      throw error;
    }
    
    // Do client-side filtering
    let filteredData = data;
    
    if (stockLevel === 'out') {
      filteredData = data.filter(item => item.quantity <= 0);
    } else if (stockLevel === 'low') {
      filteredData = data.filter(item => 
        item.quantity > 0 && item.quantity <= item.reorder_point
      );
    }
    
    return filteredData.map(formatInventoryItem);
  } catch (error) {
    console.error("Error executing custom query:", error);
    return [];
  }
};
