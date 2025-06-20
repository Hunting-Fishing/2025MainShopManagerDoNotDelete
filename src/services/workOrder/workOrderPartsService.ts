
import { supabase } from '@/integrations/supabase/client';
import { WorkOrderPart } from '@/types/workOrderPart';

// Map database fields to TypeScript interface
function mapDbToWorkOrderPart(dbPart: any): WorkOrderPart {
  return {
    id: dbPart.id,
    work_order_id: dbPart.work_order_id,
    job_line_id: dbPart.job_line_id,
    part_number: dbPart.part_number,
    name: dbPart.part_name || dbPart.name, // Handle both field names
    description: dbPart.description,
    quantity: dbPart.quantity,
    unit_price: dbPart.customer_price || dbPart.unit_price || 0, // Map customer_price to unit_price
    total_price: dbPart.total_price || (dbPart.customer_price || 0) * (dbPart.quantity || 0),
    status: dbPart.status,
    notes: dbPart.notes,
    created_at: dbPart.created_at,
    updated_at: dbPart.updated_at,
    
    // Additional properties from database
    category: dbPart.category,
    partName: dbPart.part_name,
    partNumber: dbPart.part_number,
    customerPrice: dbPart.customer_price,
    supplierCost: dbPart.supplier_cost,
    retailPrice: dbPart.retail_price,
    markupPercentage: dbPart.markup_percentage,
    isTaxable: dbPart.is_taxable,
    coreChargeAmount: dbPart.core_charge_amount,
    coreChargeApplied: dbPart.core_charge_applied,
    warrantyDuration: dbPart.warranty_duration,
    warrantyExpiryDate: dbPart.warranty_expiry_date,
    installDate: dbPart.install_date,
    installedBy: dbPart.installed_by,
    invoiceNumber: dbPart.invoice_number,
    poLine: dbPart.po_line,
    isStockItem: dbPart.is_stock_item,
    supplierName: dbPart.supplier_name,
    supplierOrderRef: dbPart.supplier_order_ref,
    notesInternal: dbPart.notes_internal,
    inventoryItemId: dbPart.inventory_item_id,
    partType: dbPart.part_type,
    estimatedArrivalDate: dbPart.estimated_arrival_date,
    itemStatus: dbPart.item_status,
    supplierSuggestedRetailPrice: dbPart.supplier_suggested_retail_price,
    dateAdded: dbPart.date_added,
    binLocation: dbPart.bin_location,
    warehouseLocation: dbPart.warehouse_location,
    shelfLocation: dbPart.shelf_location,
    attachments: dbPart.attachments
  };
}

// Map TypeScript interface to database fields
function mapWorkOrderPartToDb(part: Omit<WorkOrderPart, 'id' | 'created_at' | 'updated_at'>) {
  return {
    work_order_id: part.work_order_id,
    job_line_id: part.job_line_id || null,
    part_number: part.part_number,
    part_name: part.name, // Map name to part_name
    description: part.description || null,
    quantity: part.quantity,
    customer_price: part.unit_price, // Map unit_price to customer_price
    total_price: part.total_price,
    status: part.status || 'pending',
    notes: part.notes || null,
    category: part.category || null,
    supplier_cost: part.supplierCost || null,
    retail_price: part.retailPrice || null,
    markup_percentage: part.markupPercentage || null,
    is_taxable: part.isTaxable !== undefined ? part.isTaxable : true,
    core_charge_amount: part.coreChargeAmount || 0,
    core_charge_applied: part.coreChargeApplied || false,
    warranty_duration: part.warrantyDuration || null,
    warranty_expiry_date: part.warrantyExpiryDate || null,
    install_date: part.installDate || null,
    installed_by: part.installedBy || null,
    invoice_number: part.invoiceNumber || null,
    po_line: part.poLine || null,
    is_stock_item: part.isStockItem !== undefined ? part.isStockItem : true,
    supplier_name: part.supplierName || null,
    supplier_order_ref: part.supplierOrderRef || null,
    notes_internal: part.notesInternal || null,
    inventory_item_id: part.inventoryItemId || null,
    part_type: part.partType || null,
    estimated_arrival_date: part.estimatedArrivalDate || null,
    item_status: part.itemStatus || null,
    supplier_suggested_retail_price: part.supplierSuggestedRetailPrice || null,
    date_added: part.dateAdded || null,
    bin_location: part.binLocation || null,
    warehouse_location: part.warehouseLocation || null,
    shelf_location: part.shelfLocation || null,
    attachments: part.attachments || null
  };
}

export async function getWorkOrderParts(workOrderId: string): Promise<WorkOrderPart[]> {
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

    return (data || []).map(mapDbToWorkOrderPart);
  } catch (error) {
    console.error('Error in getWorkOrderParts:', error);
    throw error;
  }
}

export async function getJobLineParts(jobLineId: string): Promise<WorkOrderPart[]> {
  try {
    const { data, error } = await supabase
      .from('work_order_parts')
      .select('*')
      .eq('job_line_id', jobLineId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching job line parts:', error);
      throw error;
    }

    return (data || []).map(mapDbToWorkOrderPart);
  } catch (error) {
    console.error('Error in getJobLineParts:', error);
    throw error;
  }
}

export async function createWorkOrderPart(part: Omit<WorkOrderPart, 'id' | 'created_at' | 'updated_at'>): Promise<WorkOrderPart> {
  try {
    const partData = mapWorkOrderPartToDb(part);

    const { data, error } = await supabase
      .from('work_order_parts')
      .insert([partData])
      .select()
      .single();

    if (error) {
      console.error('Error creating work order part:', error);
      throw error;
    }

    return mapDbToWorkOrderPart(data);
  } catch (error) {
    console.error('Error in createWorkOrderPart:', error);
    throw error;
  }
}

export async function updateWorkOrderPart(partId: string, updates: Partial<WorkOrderPart>): Promise<WorkOrderPart> {
  try {
    // Convert the updates to database format
    const dbUpdates: any = {};
    
    if (updates.name !== undefined) dbUpdates.part_name = updates.name;
    if (updates.unit_price !== undefined) dbUpdates.customer_price = updates.unit_price;
    if (updates.total_price !== undefined) dbUpdates.total_price = updates.total_price;
    if (updates.part_number !== undefined) dbUpdates.part_number = updates.part_number;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.quantity !== undefined) dbUpdates.quantity = updates.quantity;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.job_line_id !== undefined) dbUpdates.job_line_id = updates.job_line_id;
    
    // Add timestamp
    dbUpdates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('work_order_parts')
      .update(dbUpdates)
      .eq('id', partId)
      .select()
      .single();

    if (error) {
      console.error('Error updating work order part:', error);
      throw error;
    }

    return mapDbToWorkOrderPart(data);
  } catch (error) {
    console.error('Error in updateWorkOrderPart:', error);
    throw error;
  }
}

export async function deleteWorkOrderPart(partId: string): Promise<void> {
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
}
