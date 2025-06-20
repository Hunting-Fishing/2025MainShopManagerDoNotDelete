
import { supabase } from '@/integrations/supabase/client';
import { WorkOrderPart } from '@/types/workOrderPart';

// First, let's check what the actual table structure looks like
export const checkTableStructure = async () => {
  const { data, error } = await supabase
    .from('work_order_parts')
    .select('*')
    .limit(1);
  
  console.log('Table structure check:', { data, error });
  return { data, error };
};

// Map database row to WorkOrderPart interface
const mapDbRowToWorkOrderPart = (dbRow: any): WorkOrderPart => {
  return {
    id: dbRow.id,
    work_order_id: dbRow.work_order_id,
    job_line_id: dbRow.job_line_id,
    part_number: dbRow.part_number || dbRow.part_name || '',
    name: dbRow.name || dbRow.part_name || '',
    description: dbRow.description || '',
    quantity: dbRow.quantity || 0,
    unit_price: dbRow.unit_price || dbRow.customer_price || 0,
    total_price: dbRow.total_price || (dbRow.quantity * (dbRow.unit_price || dbRow.customer_price || 0)),
    status: dbRow.status || 'pending',
    notes: dbRow.notes || '',
    created_at: dbRow.created_at,
    updated_at: dbRow.updated_at,
    // Map additional fields if they exist
    category: dbRow.category,
    partName: dbRow.part_name,
    partNumber: dbRow.part_number,
    customerPrice: dbRow.customer_price,
    supplierCost: dbRow.supplier_cost,
    retailPrice: dbRow.retail_price,
    markupPercentage: dbRow.markup_percentage,
    isTaxable: dbRow.is_taxable,
    coreChargeAmount: dbRow.core_charge_amount,
    coreChargeApplied: dbRow.core_charge_applied,
    warrantyDuration: dbRow.warranty_duration,
    warrantyExpiryDate: dbRow.warranty_expiry_date,
    installDate: dbRow.install_date,
    installedBy: dbRow.installed_by,
    invoiceNumber: dbRow.invoice_number,
    poLine: dbRow.po_line,
    isStockItem: dbRow.is_stock_item,
    supplierName: dbRow.supplier_name,
    supplierOrderRef: dbRow.supplier_order_ref,
    notesInternal: dbRow.notes_internal,
    inventoryItemId: dbRow.inventory_item_id,
    partType: dbRow.part_type,
    estimatedArrivalDate: dbRow.estimated_arrival_date,
    itemStatus: dbRow.item_status,
    supplierSuggestedRetailPrice: dbRow.supplier_suggested_retail_price,
    dateAdded: dbRow.date_added,
    binLocation: dbRow.bin_location,
    warehouseLocation: dbRow.warehouse_location,
    shelfLocation: dbRow.shelf_location,
    attachments: dbRow.attachments
  };
};

// Map WorkOrderPart to database format
const mapWorkOrderPartToDb = (part: Partial<WorkOrderPart>) => {
  return {
    work_order_id: part.work_order_id,
    job_line_id: part.job_line_id,
    part_number: part.part_number,
    part_name: part.name, // Map name to part_name
    description: part.description,
    quantity: part.quantity,
    customer_price: part.unit_price, // Map unit_price to customer_price
    part_type: part.partType || 'standard',
    status: part.status,
    notes: part.notes,
    category: part.category,
    supplier_cost: part.supplierCost,
    retail_price: part.retailPrice,
    markup_percentage: part.markupPercentage,
    is_taxable: part.isTaxable,
    core_charge_amount: part.coreChargeAmount,
    core_charge_applied: part.coreChargeApplied,
    warranty_duration: part.warrantyDuration,
    warranty_expiry_date: part.warrantyExpiryDate,
    install_date: part.installDate,
    installed_by: part.installedBy,
    invoice_number: part.invoiceNumber,
    po_line: part.poLine,
    is_stock_item: part.isStockItem,
    supplier_name: part.supplierName,
    supplier_order_ref: part.supplierOrderRef,
    notes_internal: part.notesInternal,
    inventory_item_id: part.inventoryItemId,
    estimated_arrival_date: part.estimatedArrivalDate,
    item_status: part.itemStatus,
    supplier_suggested_retail_price: part.supplierSuggestedRetailPrice,
    date_added: part.dateAdded,
    bin_location: part.binLocation,
    warehouse_location: part.warehouseLocation,
    shelf_location: part.shelfLocation,
    attachments: part.attachments
  };
};

export const getWorkOrderParts = async (workOrderId: string): Promise<WorkOrderPart[]> => {
  const { data, error } = await supabase
    .from('work_order_parts')
    .select('*')
    .eq('work_order_id', workOrderId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching work order parts:', error);
    throw error;
  }

  return (data || []).map(mapDbRowToWorkOrderPart);
};

export const getJobLineParts = async (jobLineId: string): Promise<WorkOrderPart[]> => {
  const { data, error } = await supabase
    .from('work_order_parts')
    .select('*')
    .eq('job_line_id', jobLineId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching job line parts:', error);
    throw error;
  }

  return (data || []).map(mapDbRowToWorkOrderPart);
};

export const createWorkOrderPart = async (partData: Omit<WorkOrderPart, 'id' | 'created_at' | 'updated_at'>): Promise<WorkOrderPart> => {
  const dbData = mapWorkOrderPartToDb(partData);
  
  const { data, error } = await supabase
    .from('work_order_parts')
    .insert([dbData])
    .select()
    .single();

  if (error) {
    console.error('Error creating work order part:', error);
    throw error;
  }

  return mapDbRowToWorkOrderPart(data);
};

export const updateWorkOrderPart = async (partId: string, updates: Partial<WorkOrderPart>): Promise<WorkOrderPart> => {
  const dbUpdates = mapWorkOrderPartToDb(updates);
  
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

  return mapDbRowToWorkOrderPart(data);
};

export const deleteWorkOrderPart = async (partId: string): Promise<void> => {
  const { error } = await supabase
    .from('work_order_parts')
    .delete()
    .eq('id', partId);

  if (error) {
    console.error('Error deleting work order part:', error);
    throw error;
  }
};
