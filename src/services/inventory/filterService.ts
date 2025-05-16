
import { supabase } from "@/lib/supabase";
import { InventoryItemExtended } from "@/types/inventory";
import { mapApiToInventoryItem } from "./utils";

/**
 * Filter inventory items based on search criteria
 */
export const filterInventoryItems = async (searchQuery: string, filters: any = {}) => {
  try {
    let query = supabase.from("inventory_items").select("*");

    if (searchQuery) {
      query = query.or(`name.ilike.%${searchQuery}%,sku.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
    }

    if (filters.category) {
      if (Array.isArray(filters.category) && filters.category.length > 0) {
        query = query.in('category', filters.category);
      } else if (typeof filters.category === 'string' && filters.category) {
        query = query.eq('category', filters.category);
      }
    }

    if (filters.status) {
      if (Array.isArray(filters.status) && filters.status.length > 0) {
        query = query.in('status', filters.status);
      } else if (typeof filters.status === 'string' && filters.status) {
        query = query.eq('status', filters.status);
      }
    }

    if (filters.supplier) {
      query = query.eq('supplier', filters.supplier);
    }

    if (filters.location) {
      query = query.eq('location', filters.location);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Map data to inventory items
    return (data || []).map(mapApiToInventoryItem);
  } catch (error) {
    console.error("Error filtering inventory items:", error);
    return [];
  }
};

/**
 * Get all inventory categories
 */
export const getInventoryCategories = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from("inventory_items")
      .select("category")
      .not("category", "is", null);

    if (error) throw error;
    
    const categories = data
      .map((item) => item.category)
      .filter(Boolean)
      .filter((value, index, self) => self.indexOf(value) === index)
      .sort();
      
    return categories;
  } catch (error) {
    console.error("Error fetching inventory categories:", error);
    return [];
  }
};

/**
 * Get all inventory suppliers
 */
export const getInventorySuppliers = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from("inventory_items")
      .select("supplier")
      .not("supplier", "is", null);

    if (error) throw error;
    
    const suppliers = data
      .map((item) => item.supplier)
      .filter(Boolean)
      .filter((value, index, self) => self.indexOf(value) === index)
      .sort();
      
    return suppliers;
  } catch (error) {
    console.error("Error fetching inventory suppliers:", error);
    return [];
  }
};

/**
 * Get all inventory locations
 */
export const getInventoryLocations = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from("inventory_items")
      .select("location")
      .not("location", "is", null);

    if (error) throw error;
    
    const locations = data
      .map((item) => item.location)
      .filter(Boolean)
      .filter((value, index, self) => self.indexOf(value) === index)
      .sort();
      
    return locations;
  } catch (error) {
    console.error("Error fetching inventory locations:", error);
    return [];
  }
};

/**
 * Get all inventory statuses
 */
export const getInventoryStatuses = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from("inventory_items")
      .select("status")
      .not("status", "is", null);

    if (error) throw error;
    
    const statuses = data
      .map((item) => item.status)
      .filter(Boolean)
      .filter((value, index, self) => self.indexOf(value) === index)
      .sort();
      
    return statuses;
  } catch (error) {
    console.error("Error fetching inventory statuses:", error);
    return [];
  }
};

/**
 * Get low stock items
 */
export const getLowStockItems = async () => {
  try {
    const { data, error } = await supabase
      .from("inventory_items")
      .select("*")
      .gt("quantity", 0) // Greater than 0
      .lte("quantity", supabase.raw("reorder_point")); // Less than or equal to reorder_point

    if (error) throw error;
    
    return (data || []).map(mapApiToInventoryItem);
  } catch (error) {
    console.error("Error fetching low stock items:", error);
    return [];
  }
};

/**
 * Get out of stock items
 */
export const getOutOfStockItems = async () => {
  try {
    const { data, error } = await supabase
      .from("inventory_items")
      .select("*")
      .lte("quantity", 0); // Less than or equal to 0

    if (error) throw error;
    
    return (data || []).map(mapApiToInventoryItem);
  } catch (error) {
    console.error("Error fetching out of stock items:", error);
    return [];
  }
};
