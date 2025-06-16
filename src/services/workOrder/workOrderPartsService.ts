
import { supabase } from '@/integrations/supabase/client';
import { WorkOrderPart, WorkOrderPartFormValues } from '@/types/workOrderPart';

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

    // Transform database fields to match WorkOrderPart interface
    return (data || []).map(dbPart => ({
      id: dbPart.id,
      work_order_id: dbPart.work_order_id,
      job_line_id: dbPart.job_line_id,
      part_number: dbPart.part_number,
      name: dbPart.part_name || dbPart.part_number, // Use part_name from DB
      description: dbPart.notes_internal || '', // Map to available field
      quantity: dbPart.quantity,
      unit_price: dbPart.customer_price || 0, // Use customer_price as unit_price
      total_price: (dbPart.customer_price || 0) * (dbPart.quantity || 1), // Calculate total
      status: dbPart.status,
      notes: dbPart.notes_internal,
      created_at: dbPart.created_at,
      updated_at: dbPart.updated_at,
      
      // Additional fields that exist in the database
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
      dateAdded: dbPart.date_added,
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
      shelfLocation: dbPart.shelf_location,
      
      // Aliases
      workOrderId: dbPart.work_order_id,
      jobLineId: dbPart.job_line_id
    }));
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

    // Transform database fields to match WorkOrderPart interface
    return (data || []).map(dbPart => ({
      id: dbPart.id,
      work_order_id: dbPart.work_order_id,
      job_line_id: dbPart.job_line_id,
      part_number: dbPart.part_number,
      name: dbPart.part_name || dbPart.part_number,
      description: dbPart.notes_internal || '',
      quantity: dbPart.quantity,
      unit_price: dbPart.customer_price || 0,
      total_price: (dbPart.customer_price || 0) * (dbPart.quantity || 1),
      status: dbPart.status,
      notes: dbPart.notes_internal,
      created_at: dbPart.created_at,
      updated_at: dbPart.updated_at,
      
      // Additional fields
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
      dateAdded: dbPart.date_added,
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
      shelfLocation: dbPart.shelf_location,
      
      // Aliases
      workOrderId: dbPart.work_order_id,
      jobLineId: dbPart.job_line_id
    }));
  } catch (error) {
    console.error('Error in getJobLineParts:', error);
    throw error;
  }
}

export async function createWorkOrderPart(
  workOrderId: string,
  partData: WorkOrderPartFormValues
): Promise<WorkOrderPart> {
  try {
    const { data, error } = await supabase
      .from('work_order_parts')
      .insert({
        work_order_id: workOrderId,
        job_line_id: partData.job_line_id,
        part_number: partData.part_number,
        part_name: partData.name || partData.partName,
        quantity: partData.quantity || 1,
        customer_price: partData.unit_price || partData.customerPrice || 0,
        status: partData.status || 'pending',
        notes_internal: partData.notes || partData.notesInternal,
        supplier_name: partData.supplierName,
        supplier_cost: partData.supplierCost,
        supplier_suggested_retail_price: partData.supplierSuggestedRetailPrice,
        retail_price: partData.retailPrice,
        category: partData.category,
        part_type: partData.partType,
        markup_percentage: partData.markupPercentage,
        is_taxable: partData.isTaxable,
        core_charge_amount: partData.coreChargeAmount,
        core_charge_applied: partData.coreChargeApplied,
        warranty_duration: partData.warrantyDuration,
        invoice_number: partData.invoiceNumber,
        po_line: partData.poLine,
        is_stock_item: partData.isStockItem,
        bin_location: partData.binLocation,
        install_date: partData.installDate,
        installed_by: partData.installedBy,
        inventory_item_id: partData.inventoryItemId,
        attachments: partData.attachments,
        warehouse_location: partData.warehouseLocation,
        shelf_location: partData.shelfLocation
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating work order part:', error);
      throw error;
    }

    // Transform the response
    const dbPart = data;
    return {
      id: dbPart.id,
      work_order_id: dbPart.work_order_id,
      job_line_id: dbPart.job_line_id,
      part_number: dbPart.part_number,
      name: dbPart.part_name || dbPart.part_number,
      description: dbPart.notes_internal || '',
      quantity: dbPart.quantity,
      unit_price: dbPart.customer_price || 0,
      total_price: (dbPart.customer_price || 0) * (dbPart.quantity || 1),
      status: dbPart.status,
      notes: dbPart.notes_internal,
      created_at: dbPart.created_at,
      updated_at: dbPart.updated_at,
      
      // Additional fields
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
      dateAdded: dbPart.date_added,
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
      shelfLocation: dbPart.shelf_location,
      
      // Aliases
      workOrderId: dbPart.work_order_id,
      jobLineId: dbPart.job_line_id
    };
  } catch (error) {
    console.error('Error in createWorkOrderPart:', error);
    throw error;
  }
}

export async function updateWorkOrderPart(
  partId: string,
  partData: Partial<WorkOrderPartFormValues>
): Promise<WorkOrderPart> {
  try {
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    // Map form fields to database fields
    if (partData.part_number) updateData.part_number = partData.part_number;
    if (partData.name || partData.partName) updateData.part_name = partData.name || partData.partName;
    if (partData.quantity !== undefined) updateData.quantity = partData.quantity;
    if (partData.unit_price !== undefined || partData.customerPrice !== undefined) {
      updateData.customer_price = partData.unit_price || partData.customerPrice;
    }
    if (partData.status) updateData.status = partData.status;
    if (partData.notes || partData.notesInternal) updateData.notes_internal = partData.notes || partData.notesInternal;
    if (partData.job_line_id !== undefined) updateData.job_line_id = partData.job_line_id;
    if (partData.supplierName) updateData.supplier_name = partData.supplierName;
    if (partData.supplierCost !== undefined) updateData.supplier_cost = partData.supplierCost;
    if (partData.supplierSuggestedRetailPrice !== undefined) updateData.supplier_suggested_retail_price = partData.supplierSuggestedRetailPrice;
    if (partData.retailPrice !== undefined) updateData.retail_price = partData.retailPrice;
    if (partData.category) updateData.category = partData.category;
    if (partData.partType) updateData.part_type = partData.partType;
    if (partData.markupPercentage !== undefined) updateData.markup_percentage = partData.markupPercentage;
    if (partData.isTaxable !== undefined) updateData.is_taxable = partData.isTaxable;
    if (partData.coreChargeAmount !== undefined) updateData.core_charge_amount = partData.coreChargeAmount;
    if (partData.coreChargeApplied !== undefined) updateData.core_charge_applied = partData.coreChargeApplied;
    if (partData.warrantyDuration) updateData.warranty_duration = partData.warrantyDuration;
    if (partData.invoiceNumber) updateData.invoice_number = partData.invoiceNumber;
    if (partData.poLine) updateData.po_line = partData.poLine;
    if (partData.isStockItem !== undefined) updateData.is_stock_item = partData.isStockItem;
    if (partData.binLocation) updateData.bin_location = partData.binLocation;
    if (partData.installDate) updateData.install_date = partData.installDate;
    if (partData.installedBy) updateData.installed_by = partData.installedBy;
    if (partData.inventoryItemId) updateData.inventory_item_id = partData.inventoryItemId;
    if (partData.attachments) updateData.attachments = partData.attachments;
    if (partData.warehouseLocation) updateData.warehouse_location = partData.warehouseLocation;
    if (partData.shelfLocation) updateData.shelf_location = partData.shelfLocation;

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

    // Transform the response
    const dbPart = data;
    return {
      id: dbPart.id,
      work_order_id: dbPart.work_order_id,
      job_line_id: dbPart.job_line_id,
      part_number: dbPart.part_number,
      name: dbPart.part_name || dbPart.part_number,
      description: dbPart.notes_internal || '',
      quantity: dbPart.quantity,
      unit_price: dbPart.customer_price || 0,
      total_price: (dbPart.customer_price || 0) * (dbPart.quantity || 1),
      status: dbPart.status,
      notes: dbPart.notes_internal,
      created_at: dbPart.created_at,
      updated_at: dbPart.updated_at,
      
      // Additional fields
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
      dateAdded: dbPart.date_added,
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
      shelfLocation: dbPart.shelf_location,
      
      // Aliases
      workOrderId: dbPart.work_order_id,
      jobLineId: dbPart.job_line_id
    };
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
