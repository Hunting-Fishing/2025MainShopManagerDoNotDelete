
import { InventoryItemExtended, AutoReorderSettings } from '@/types/inventory';
import { supabase } from '@/lib/supabase';

/**
 * Get inventory status based on quantity and reorder point
 */
export const getInventoryStatus = (item: InventoryItemExtended): string => {
  const quantity = Number(item.quantity) || 0;
  const reorderPoint = Number(item.reorder_point) || 0;

  if (quantity <= 0) {
    return "Out of Stock";
  } else if (quantity <= reorderPoint) {
    return "Low Stock";
  } else {
    return "In Stock";
  }
};

/**
 * Count low stock items in inventory
 */
export const countLowStockItems = (items: InventoryItemExtended[]): number => {
  return items.filter(item => {
    const quantity = Number(item.quantity) || 0;
    const reorderPoint = Number(item.reorder_point) || 0;
    return quantity > 0 && quantity <= reorderPoint;
  }).length;
};

/**
 * Count out of stock items in inventory
 */
export const countOutOfStockItems = (items: InventoryItemExtended[]): number => {
  return items.filter(item => {
    const quantity = Number(item.quantity) || 0;
    return quantity <= 0;
  }).length;
};

/**
 * Calculate total inventory value
 */
export const calculateTotalValue = (items: InventoryItemExtended[]): number => {
  return items.reduce((total, item) => {
    const quantity = Number(item.quantity) || 0;
    const unitPrice = Number(item.unit_price) || 0;
    return total + (quantity * unitPrice);
  }, 0);
};

/**
 * Format inventory item ensuring all required properties are present
 */
export const formatInventoryItem = (item: Partial<InventoryItemExtended>): InventoryItemExtended => {
  return {
    id: item.id || crypto.randomUUID(),
    name: item.name || '',
    sku: item.sku || '',
    category: item.category || '',
    description: item.description || '',
    quantity: Number(item.quantity) || 0,
    reorder_point: Number(item.reorder_point) || 10,
    unit_price: Number(item.unit_price) || 0,
    price: Number(item.unit_price) || Number(item.price) || 0, // Map unit_price to price
    supplier: item.supplier || '',
    location: item.location || '',
    status: item.status || 'In Stock',
    created_at: item.created_at || new Date().toISOString(),
    updated_at: item.updated_at || new Date().toISOString(),
    partNumber: item.partNumber || '',
    barcode: item.barcode || '',
    subcategory: item.subcategory || '',
    manufacturer: item.manufacturer || '',
    vehicleCompatibility: item.vehicleCompatibility || '',
    onHold: item.onHold || 0,
    onOrder: item.onOrder || 0,
    cost: item.cost || 0,
    marginMarkup: item.marginMarkup || 0,
    warrantyPeriod: item.warrantyPeriod || '',
    dateBought: item.dateBought || '',
    dateLast: item.dateLast || '',
    notes: item.notes || ''
  };
};

/**
 * Format inventory data for API submission
 */
export const formatInventoryForApi = (item: Partial<InventoryItemExtended>): any => {
  return {
    ...item,
    quantity: Number(item.quantity),
    reorder_point: Number(item.reorder_point),
    unit_price: Number(item.price || item.unit_price),
  };
};

/**
 * Clear all inventory items - CAREFUL: Destructive operation, implemented safely as no-op
 */
export const clearAllInventoryItems = async (): Promise<boolean> => {
  try {
    // For safety, this is a soft implementation that doesn't actually delete everything
    console.warn('clearAllInventoryItems: This would normally delete all inventory items, but is implemented as a no-op for safety');
    return true;
  } catch (error) {
    console.error('Error clearing inventory items:', error);
    return false;
  }
};

/**
 * Get inventory item by ID
 */
export const getInventoryItemById = async (id: string): Promise<InventoryItemExtended | null> => {
  try {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error(`Error fetching inventory item ${id}:`, error);
      return null;
    }
    
    return formatInventoryItem(data);
  } catch (error) {
    console.error(`Exception fetching inventory item ${id}:`, error);
    return null;
  }
};

/**
 * Get all inventory items
 */
export const getAllInventoryItems = async (): Promise<InventoryItemExtended[]> => {
  try {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*');
    
    if (error) {
      console.error('Error fetching inventory items:', error);
      return [];
    }
    
    return data?.map(formatInventoryItem) || [];
  } catch (error) {
    console.error('Exception fetching inventory items:', error);
    return [];
  }
};

/**
 * Re-export from inventory utils to maintain backward compatibility
 */
export const mapApiToInventoryItem = formatInventoryItem;
