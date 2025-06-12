
import { supabase } from "@/lib/supabase";
import { WorkOrderPart } from "@/types/workOrderPart";

export const getWorkOrderParts = async (workOrderId: string): Promise<WorkOrderPart[]> => {
  try {
    const { data, error } = await supabase
      .from('work_order_parts')
      .select('*')
      .eq('work_order_id', workOrderId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching work order parts:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getWorkOrderParts:', error);
    throw error;
  }
};

export const createWorkOrderPart = async (part: Omit<WorkOrderPart, 'id' | 'created_at' | 'updated_at'>): Promise<WorkOrderPart> => {
  try {
    const { data, error } = await supabase
      .from('work_order_parts')
      .insert([part])
      .select()
      .single();

    if (error) {
      console.error('Error creating work order part:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in createWorkOrderPart:', error);
    throw error;
  }
};

export const updateWorkOrderPart = async (partId: string, updates: Partial<WorkOrderPart>): Promise<WorkOrderPart> => {
  try {
    // Calculate total_price if quantity or unit_price changed
    const calculatedUpdates = { ...updates };
    if (updates.quantity !== undefined || updates.unit_price !== undefined) {
      // Fetch current part to get missing values
      const { data: currentPart } = await supabase
        .from('work_order_parts')
        .select('quantity, unit_price')
        .eq('id', partId)
        .single();
      
      if (currentPart) {
        const quantity = updates.quantity ?? currentPart.quantity ?? 1;
        const unitPrice = updates.unit_price ?? currentPart.unit_price ?? 0;
        calculatedUpdates.total_price = quantity * unitPrice;
      }
    }

    const { data, error } = await supabase
      .from('work_order_parts')
      .update(calculatedUpdates)
      .eq('id', partId)
      .select()
      .single();

    if (error) {
      console.error('Error updating work order part:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in updateWorkOrderPart:', error);
    throw error;
  }
};

export const deleteWorkOrderPart = async (partId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('work_order_parts')
      .delete()
      .eq('id', partId);

    if (error) {
      console.error('Error deleting work order part:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in deleteWorkOrderPart:', error);
    throw error;
  }
};

// Helper function to transform database row to WorkOrderPart interface
export const transformPartData = (dbRow: any): WorkOrderPart => {
  // Map database column names to interface properties
  return {
    id: dbRow.id,
    work_order_id: dbRow.work_order_id,
    job_line_id: dbRow.job_line_id,
    part_number: dbRow.part_number || dbRow.partNumber,
    name: dbRow.part_name || dbRow.name, // Try part_name first, fallback to name
    description: dbRow.description,
    quantity: Number(dbRow.quantity) || 1,
    unit_price: Number(dbRow.customer_price) || Number(dbRow.unit_price) || 0, // Try customer_price first
    total_price: Number(dbRow.total_price) || (Number(dbRow.quantity || 1) * Number(dbRow.customer_price || dbRow.unit_price || 0)),
    status: dbRow.status || 'pending',
    notes: dbRow.notes,
    created_at: dbRow.created_at,
    updated_at: dbRow.updated_at,
    
    // Additional properties that might exist in the database
    partName: dbRow.part_name,
    partNumber: dbRow.part_number,
    supplierName: dbRow.supplier_name,
    supplierCost: dbRow.supplier_cost,
    supplierSuggestedRetailPrice: dbRow.supplier_suggested_retail_price,
    customerPrice: dbRow.customer_price,
    retailPrice: dbRow.retail_price,
    category: dbRow.category,
    warrantyDuration: dbRow.warranty_duration,
    warrantyExpiryDate: dbRow.warranty_expiry_date,
    binLocation: dbRow.bin_location,
    installDate: dbRow.install_date,
    dateAdded: dbRow.created_at,
    partType: dbRow.part_type,
    installedBy: dbRow.installed_by,
    markupPercentage: dbRow.markup_percentage,
    inventoryItemId: dbRow.inventory_item_id,
    coreChargeApplied: dbRow.core_charge_applied,
    coreChargeAmount: dbRow.core_charge_amount,
    isTaxable: dbRow.is_taxable,
    invoiceNumber: dbRow.invoice_number,
    poLine: dbRow.po_line,
    isStockItem: dbRow.is_stock_item,
    notesInternal: dbRow.notes_internal,
    attachments: dbRow.attachments,
    warehouseLocation: dbRow.warehouse_location,
    shelfLocation: dbRow.shelf_location,
    
    // CamelCase aliases
    workOrderId: dbRow.work_order_id,
    jobLineId: dbRow.job_line_id
  };
};
