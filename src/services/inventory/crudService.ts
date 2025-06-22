
import { supabase } from "@/integrations/supabase/client";
import { InventoryItemExtended } from "@/types/inventory";

/**
 * Get all inventory items from the database
 */
export const getInventoryItems = async (): Promise<InventoryItemExtended[]> => {
  try {
    console.log('Fetching inventory items from Supabase...');
    
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    console.log('Raw data from Supabase:', data);
    
    if (!data) {
      console.log('No data returned from Supabase');
      return [];
    }

    // Map database fields to application format
    const mappedItems: InventoryItemExtended[] = data.map(item => ({
      id: item.id,
      name: item.name || '',
      sku: item.sku || '',
      description: item.description || '',
      price: item.unit_price || 0,
      unit_price: item.unit_price || 0,
      category: item.category || '',
      supplier: item.supplier || '',
      status: item.status || 'active',
      quantity: item.quantity || 0,
      reorder_point: item.reorder_point || 0,
      location: item.location || '',
      created_at: item.created_at,
      updated_at: item.updated_at,
      
      // Extended properties from database
      partNumber: item.part_number || '',
      barcode: item.barcode || '',
      subcategory: item.subcategory || '',
      manufacturer: item.manufacturer || '',
      vehicleCompatibility: item.vehicle_compatibility || '',
      measurementUnit: item.measurement_unit || '',
      onHold: item.on_hold || 0,
      onOrder: item.on_order || 0,
      minStockLevel: item.min_stock_level || 0,
      maxStockLevel: item.max_stock_level || 0,
      sellPricePerUnit: item.sell_price_per_unit || 0,
      costPerUnit: item.cost_per_unit || 0,
      marginMarkup: item.margin_markup || 0,
      taxRate: item.tax_rate || 0,
      taxExempt: item.tax_exempt || false,
      environmentalFee: item.environmental_fee || 0,
      coreCharge: item.core_charge || 0,
      hazmatFee: item.hazmat_fee || 0,
      weight: item.weight || 0,
      dimensions: item.dimensions || '',
      color: item.color || '',
      material: item.material || '',
      modelYear: item.model_year || '',
      oemPartNumber: item.oem_part_number || '',
      universalPart: item.universal_part || false,
      warrantyPeriod: item.warranty_period || '',
      dateBought: item.date_bought || '',
      dateLast: item.date_last || '',
      notes: item.notes || ''
    }));

    console.log('Mapped inventory items:', mappedItems.length);
    return mappedItems;
  } catch (error) {
    console.error('Error fetching inventory items:', error);
    throw new Error(`Failed to fetch inventory items: ${error}`);
  }
};

/**
 * Get a single inventory item by ID
 */
export const getInventoryItemById = async (id: string): Promise<InventoryItemExtended | null> => {
  try {
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Item not found
      }
      throw error;
    }

    if (!data) return null;

    // Map to application format (same mapping as above)
    return {
      id: data.id,
      name: data.name || '',
      sku: data.sku || '',
      description: data.description || '',
      price: data.unit_price || 0,
      unit_price: data.unit_price || 0,
      category: data.category || '',
      supplier: data.supplier || '',
      status: data.status || 'active',
      quantity: data.quantity || 0,
      reorder_point: data.reorder_point || 0,
      location: data.location || '',
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  } catch (error) {
    console.error('Error fetching inventory item by ID:', error);
    throw error;
  }
};

/**
 * Create a new inventory item
 */
export const createInventoryItem = async (item: Partial<InventoryItemExtended>): Promise<InventoryItemExtended> => {
  try {
    const { data, error } = await supabase
      .from('inventory')
      .insert({
        name: item.name,
        sku: item.sku,
        description: item.description,
        unit_price: item.unit_price || 0,
        category: item.category,
        supplier: item.supplier,
        status: item.status || 'active',
        quantity: item.quantity || 0,
        reorder_point: item.reorder_point || 0,
        location: item.location
      })
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('No data returned from insert');

    // Return mapped item
    return {
      id: data.id,
      name: data.name || '',
      sku: data.sku || '',
      description: data.description || '',
      price: data.unit_price || 0,
      unit_price: data.unit_price || 0,
      category: data.category || '',
      supplier: data.supplier || '',
      status: data.status || 'active',
      quantity: data.quantity || 0,
      reorder_point: data.reorder_point || 0,
      location: data.location || '',
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  } catch (error) {
    console.error('Error creating inventory item:', error);
    throw error;
  }
};

/**
 * Update an existing inventory item
 */
export const updateInventoryItem = async (id: string, updates: Partial<InventoryItemExtended>): Promise<InventoryItemExtended> => {
  try {
    const { data, error } = await supabase
      .from('inventory')
      .update({
        ...(updates.name && { name: updates.name }),
        ...(updates.sku && { sku: updates.sku }),
        ...(updates.description !== undefined && { description: updates.description }),
        ...(updates.unit_price !== undefined && { unit_price: updates.unit_price }),
        ...(updates.category !== undefined && { category: updates.category }),
        ...(updates.supplier !== undefined && { supplier: updates.supplier }),
        ...(updates.status !== undefined && { status: updates.status }),
        ...(updates.quantity !== undefined && { quantity: updates.quantity }),
        ...(updates.reorder_point !== undefined && { reorder_point: updates.reorder_point }),
        ...(updates.location !== undefined && { location: updates.location })
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('No data returned from update');

    // Return mapped item
    return {
      id: data.id,
      name: data.name || '',
      sku: data.sku || '',
      description: data.description || '',
      price: data.unit_price || 0,
      unit_price: data.unit_price || 0,
      category: data.category || '',
      supplier: data.supplier || '',
      status: data.status || 'active',
      quantity: data.quantity || 0,
      reorder_point: data.reorder_point || 0,
      location: data.location || '',
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  } catch (error) {
    console.error('Error updating inventory item:', error);
    throw error;
  }
};

/**
 * Update only the quantity of an inventory item
 */
export const updateInventoryQuantity = async (id: string, quantity: number): Promise<void> => {
  try {
    const { error } = await supabase
      .from('inventory')
      .update({ quantity })
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating inventory quantity:', error);
    throw error;
  }
};

/**
 * Delete an inventory item
 */
export const deleteInventoryItem = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('inventory')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    throw error;
  }
};
