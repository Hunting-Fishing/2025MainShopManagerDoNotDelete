
import { supabase } from '@/integrations/supabase/client';
import { WorkOrderPart, WorkOrderPartFormValues } from '@/types/workOrderPart';

// Map database fields to our interface
const mapDbToWorkOrderPart = (dbPart: any): WorkOrderPart => ({
  id: dbPart.id,
  work_order_id: dbPart.work_order_id,
  job_line_id: dbPart.job_line_id,
  part_number: dbPart.part_number,
  name: dbPart.part_name || dbPart.name,
  description: dbPart.description,
  quantity: dbPart.quantity,
  unit_price: dbPart.customer_price || dbPart.unit_price,
  total_price: dbPart.customer_price * dbPart.quantity || dbPart.total_price,
  status: dbPart.status,
  notes: dbPart.notes,
  created_at: dbPart.created_at,
  updated_at: dbPart.updated_at,
  // Map additional properties from database
  partName: dbPart.part_name,
  partNumber: dbPart.part_number,
  supplierName: dbPart.supplier_name,
  supplierCost: dbPart.supplier_cost,
  supplierSuggestedRetailPrice: dbPart.supplier_suggested_retail_price,
  customerPrice: dbPart.customer_price,
  retailPrice: dbPart.retail_price,
  category: dbPart.category,
  warrantyDuration: dbPart.warranty_duration,
  warrantyExpiryDate: dbPart.warranty_expiry_date,
  binLocation: dbPart.bin_location,
  installDate: dbPart.install_date,
  dateAdded: dbPart.date_added || dbPart.created_at,
  partType: dbPart.part_type,
  installedBy: dbPart.installed_by,
  markupPercentage: dbPart.markup_percentage,
  inventoryItemId: dbPart.inventory_item_id,
  coreChargeApplied: dbPart.core_charge_applied,
  coreChargeAmount: dbPart.core_charge_amount,
  isTaxable: dbPart.is_taxable,
  invoiceNumber: dbPart.invoice_number,
  poLine: dbPart.po_line,
  isStockItem: dbPart.is_stock_item,
  notesInternal: dbPart.notes_internal,
  attachments: dbPart.attachments,
  warehouseLocation: dbPart.warehouse_location,
  shelfLocation: dbPart.shelf_location
});

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

export async function createWorkOrderPart(
  partData: WorkOrderPartFormValues & { work_order_id: string }
): Promise<WorkOrderPart> {
  try {
    const totalPrice = partData.quantity * (partData.unit_price || partData.customerPrice || 0);
    
    const { data, error } = await supabase
      .from('work_order_parts')
      .insert({
        work_order_id: partData.work_order_id,
        job_line_id: partData.job_line_id,
        part_number: partData.part_number || partData.partNumber,
        part_name: partData.name || partData.partName,
        description: partData.description,
        quantity: partData.quantity,
        customer_price: partData.unit_price || partData.customerPrice || 0,
        supplier_name: partData.supplierName,
        supplier_cost: partData.supplierCost,
        markup_percentage: partData.markupPercentage,
        retail_price: partData.retailPrice,
        part_type: partData.partType,
        invoice_number: partData.invoiceNumber,
        po_line: partData.poLine,
        notes: partData.notes,
        category: partData.category,
        is_taxable: partData.isTaxable,
        core_charge_amount: partData.coreChargeAmount,
        core_charge_applied: partData.coreChargeApplied,
        warranty_duration: partData.warrantyDuration,
        install_date: partData.installDate,
        installed_by: partData.installedBy,
        status: partData.status || 'pending',
        is_stock_item: partData.isStockItem,
        notes_internal: partData.notesInternal,
        bin_location: partData.binLocation,
        warehouse_location: partData.warehouseLocation,
        shelf_location: partData.shelfLocation
      })
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

export async function updateWorkOrderPart(
  partId: string,
  partData: Partial<WorkOrderPart>
): Promise<WorkOrderPart> {
  try {
    const updateData: any = {};
    
    // Map interface fields to database fields
    if (partData.part_number || partData.partNumber) updateData.part_number = partData.part_number || partData.partNumber;
    if (partData.name || partData.partName) updateData.part_name = partData.name || partData.partName;
    if (partData.description) updateData.description = partData.description;
    if (partData.quantity) updateData.quantity = partData.quantity;
    if (partData.unit_price || partData.customerPrice) updateData.customer_price = partData.unit_price || partData.customerPrice;
    if (partData.supplierName) updateData.supplier_name = partData.supplierName;
    if (partData.supplierCost) updateData.supplier_cost = partData.supplierCost;
    if (partData.markupPercentage) updateData.markup_percentage = partData.markupPercentage;
    if (partData.retailPrice) updateData.retail_price = partData.retailPrice;
    if (partData.partType) updateData.part_type = partData.partType;
    if (partData.invoiceNumber) updateData.invoice_number = partData.invoiceNumber;
    if (partData.poLine) updateData.po_line = partData.poLine;
    if (partData.notes) updateData.notes = partData.notes;
    if (partData.category) updateData.category = partData.category;
    if (partData.isTaxable !== undefined) updateData.is_taxable = partData.isTaxable;
    if (partData.coreChargeAmount) updateData.core_charge_amount = partData.coreChargeAmount;
    if (partData.coreChargeApplied !== undefined) updateData.core_charge_applied = partData.coreChargeApplied;
    if (partData.warrantyDuration) updateData.warranty_duration = partData.warrantyDuration;
    if (partData.installDate) updateData.install_date = partData.installDate;
    if (partData.installedBy) updateData.installed_by = partData.installedBy;
    if (partData.status) updateData.status = partData.status;
    if (partData.isStockItem !== undefined) updateData.is_stock_item = partData.isStockItem;
    if (partData.notesInternal) updateData.notes_internal = partData.notesInternal;
    if (partData.binLocation) updateData.bin_location = partData.binLocation;
    if (partData.warehouseLocation) updateData.warehouse_location = partData.warehouseLocation;
    if (partData.shelfLocation) updateData.shelf_location = partData.shelfLocation;
    if (partData.job_line_id || partData.jobLineId) updateData.job_line_id = partData.job_line_id || partData.jobLineId;
    
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('work_order_parts')
      .update(updateData)
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
