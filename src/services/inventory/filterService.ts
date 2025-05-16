
import { InventoryItemExtended } from "@/types/inventory";
import { supabase } from "@/lib/supabase";
import { formatInventoryItem } from "./utils";

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
      query = query.gt('quantity', 0).lte('quantity', query.select('reorder_point').eq('id', query.select('id')));
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
    
    return data.map(item => formatInventoryItem(item));
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
      .select('*')
      .gt('quantity', 0)
      .lte('quantity', supabase.rpc('get_reorder_point', { item_id: 'id' }));
    
    if (error) {
      throw error;
    }
    
    return data.map(formatInventoryItem);
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

// SQL function for getting stock alerts - this is a mock implementation
const getStockQuery = (condition: string): string => {
  return `
    SELECT * 
    FROM inventory_items
    WHERE ${condition}
    ORDER BY name
  `;
};

// There are migration issues with supabase.raw, so we'll use a different approach without .raw
export const executeCustomQuery = async (sql: string): Promise<InventoryItemExtended[]> => {
  try {
    // This is a mock implementation since we can't use .raw directly
    // In a real implementation, you would use stored procedures or RPC calls
    console.log("Would execute SQL:", sql);
    
    // Instead we'll use the filter approach
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*');
      
    if (error) {
      throw error;
    }
    
    // Do client-side filtering based on what the SQL would do
    // This is just a fallback and not efficient for large datasets
    return data
      .filter(item => {
        if (sql.includes("quantity <= 0")) {
          return item.quantity <= 0;
        } else if (sql.includes("quantity > 0 AND quantity <= reorder_point")) {
          return item.quantity > 0 && item.quantity <= item.reorder_point;
        }
        return true;
      })
      .map(formatInventoryItem);
  } catch (error) {
    console.error("Error executing custom query:", error);
    return [];
  }
};
