
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
    return (data || []).map(part => ({
      id: part.id,
      work_order_id: part.work_order_id,
      job_line_id: part.job_line_id,
      part_number: part.part_number,
      name: part.part_name || '',
      description: part.notes_internal || '',
      quantity: part.quantity,
      unit_price: part.customer_price,
      total_price: (part.customer_price || 0) * (part.quantity || 0),
      status: part.status,
      notes: part.notes,
      created_at: part.created_at,
      updated_at: part.updated_at,
      
      // Additional properties for parts tracking
      partName: part.part_name,
      partNumber: part.part_number,
      supplierName: part.supplier_name,
      supplierCost: part.supplier_cost,
      supplierSuggestedRetailPrice: part.supplier_suggested_retail_price,
      customerPrice: part.customer_price,
      retailPrice: part.retail_price,
      category: part.category,
      warrantyDuration: part.warranty_duration,
      warrantyExpiryDate: part.warranty_expiry_date,
      installDate: part.install_date,
      dateAdded: part.date_added,
      partType: part.part_type,
      installedBy: part.installed_by,
      markupPercentage: part.markup_percentage,
      inventoryItemId: part.inventory_item_id,
      coreChargeApplied: part.core_charge_applied,
      coreChargeAmount: part.core_charge_amount,
      isTaxable: part.is_taxable,
      invoiceNumber: part.invoice_number,
      poLine: part.po_line,
      isStockItem: part.is_stock_item,
      notesInternal: part.notes_internal,
      attachments: part.attachments,
      
      // CamelCase aliases for backward compatibility
      workOrderId: part.work_order_id,
      jobLineId: part.job_line_id
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
    return (data || []).map(part => ({
      id: part.id,
      work_order_id: part.work_order_id,
      job_line_id: part.job_line_id,
      part_number: part.part_number,
      name: part.part_name || '',
      description: part.notes_internal || '',
      quantity: part.quantity,
      unit_price: part.customer_price,
      total_price: (part.customer_price || 0) * (part.quantity || 0),
      status: part.status,
      notes: part.notes,
      created_at: part.created_at,
      updated_at: part.updated_at,
      
      // Additional properties for parts tracking
      partName: part.part_name,
      partNumber: part.part_number,
      supplierName: part.supplier_name,
      supplierCost: part.supplier_cost,
      supplierSuggestedRetailPrice: part.supplier_suggested_retail_price,
      customerPrice: part.customer_price,
      retailPrice: part.retail_price,
      category: part.category,
      warrantyDuration: part.warranty_duration,
      warrantyExpiryDate: part.warranty_expiry_date,
      installDate: part.install_date,
      dateAdded: part.date_added,
      partType: part.part_type,
      installedBy: part.installed_by,
      markupPercentage: part.markup_percentage,
      inventoryItemId: part.inventory_item_id,
      coreChargeApplied: part.core_charge_applied,
      coreChargeAmount: part.core_charge_amount,
      isTaxable: part.is_taxable,
      invoiceNumber: part.invoice_number,
      poLine: part.po_line,
      isStockItem: part.is_stock_item,
      notesInternal: part.notes_internal,
      attachments: part.attachments,
      
      // CamelCase aliases for backward compatibility
      workOrderId: part.work_order_id,
      jobLineId: part.job_line_id
    }));
  } catch (error) {
    console.error('Error in getJobLineParts:', error);
    throw error;
  }
}

export async function createWorkOrderPart(formValues: WorkOrderPartFormValues & { work_order_id: string }): Promise<WorkOrderPart> {
  try {
    const totalPrice = (formValues.unit_price || formValues.customerPrice || 0) * (formValues.quantity || 1);

    const { data, error } = await supabase
      .from('work_order_parts')
      .insert({
        work_order_id: formValues.work_order_id,
        job_line_id: formValues.job_line_id,
        part_number: formValues.part_number,
        part_name: formValues.name || formValues.partName || '',
        customer_price: formValues.unit_price || formValues.customerPrice || 0,
        quantity: formValues.quantity || 1,
        notes: formValues.notes,
        status: formValues.status || 'pending',
        category: formValues.category,
        part_type: formValues.partType,
        supplier_name: formValues.supplierName,
        supplier_cost: formValues.supplierCost,
        supplier_suggested_retail_price: formValues.supplierSuggestedRetailPrice,
        retail_price: formValues.retailPrice,
        markup_percentage: formValues.markupPercentage,
        is_taxable: formValues.isTaxable,
        core_charge_amount: formValues.coreChargeAmount,
        core_charge_applied: formValues.coreChargeApplied,
        warranty_duration: formValues.warrantyDuration,
        invoice_number: formValues.invoiceNumber,
        po_line: formValues.poLine,
        is_stock_item: formValues.isStockItem,
        notes_internal: formValues.notesInternal,
        install_date: formValues.installDate,
        installed_by: formValues.installedBy,
        inventory_item_id: formValues.inventoryItemId,
        attachments: formValues.attachments
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating work order part:', error);
      throw error;
    }

    // Transform response to match WorkOrderPart interface
    return {
      id: data.id,
      work_order_id: data.work_order_id,
      job_line_id: data.job_line_id,
      part_number: data.part_number,
      name: data.part_name || '',
      description: data.notes_internal || '',
      quantity: data.quantity,
      unit_price: data.customer_price,
      total_price: totalPrice,
      status: data.status,
      notes: data.notes,
      created_at: data.created_at,
      updated_at: data.updated_at,
      
      // Additional properties
      partName: data.part_name,
      partNumber: data.part_number,
      supplierName: data.supplier_name,
      supplierCost: data.supplier_cost,
      supplierSuggestedRetailPrice: data.supplier_suggested_retail_price,
      customerPrice: data.customer_price,
      retailPrice: data.retail_price,
      category: data.category,
      warrantyDuration: data.warranty_duration,
      warrantyExpiryDate: data.warranty_expiry_date,
      installDate: data.install_date,
      dateAdded: data.date_added,
      partType: data.part_type,
      installedBy: data.installed_by,
      markupPercentage: data.markup_percentage,
      inventoryItemId: data.inventory_item_id,
      coreChargeApplied: data.core_charge_applied,
      coreChargeAmount: data.core_charge_amount,
      isTaxable: data.is_taxable,
      invoiceNumber: data.invoice_number,
      poLine: data.po_line,
      isStockItem: data.is_stock_item,
      notesInternal: data.notes_internal,
      attachments: data.attachments,
      
      // CamelCase aliases
      workOrderId: data.work_order_id,
      jobLineId: data.job_line_id
    };
  } catch (error) {
    console.error('Error in createWorkOrderPart:', error);
    throw error;
  }
}

export async function updateWorkOrderPart(partId: string, formValues: Partial<WorkOrderPartFormValues>): Promise<WorkOrderPart> {
  try {
    const updateData: any = {};
    
    if (formValues.part_number) updateData.part_number = formValues.part_number;
    if (formValues.name || formValues.partName) updateData.part_name = formValues.name || formValues.partName;
    if (formValues.unit_price !== undefined || formValues.customerPrice !== undefined) {
      updateData.customer_price = formValues.unit_price || formValues.customerPrice;
    }
    if (formValues.quantity !== undefined) updateData.quantity = formValues.quantity;
    if (formValues.notes !== undefined) updateData.notes = formValues.notes;
    if (formValues.status) updateData.status = formValues.status;
    if (formValues.category) updateData.category = formValues.category;
    if (formValues.partType) updateData.part_type = formValues.partType;
    if (formValues.supplierName) updateData.supplier_name = formValues.supplierName;
    if (formValues.supplierCost !== undefined) updateData.supplier_cost = formValues.supplierCost;
    if (formValues.supplierSuggestedRetailPrice !== undefined) updateData.supplier_suggested_retail_price = formValues.supplierSuggestedRetailPrice;
    if (formValues.retailPrice !== undefined) updateData.retail_price = formValues.retailPrice;
    if (formValues.markupPercentage !== undefined) updateData.markup_percentage = formValues.markupPercentage;
    if (formValues.isTaxable !== undefined) updateData.is_taxable = formValues.isTaxable;
    if (formValues.coreChargeAmount !== undefined) updateData.core_charge_amount = formValues.coreChargeAmount;
    if (formValues.coreChargeApplied !== undefined) updateData.core_charge_applied = formValues.coreChargeApplied;
    if (formValues.warrantyDuration) updateData.warranty_duration = formValues.warrantyDuration;
    if (formValues.invoiceNumber) updateData.invoice_number = formValues.invoiceNumber;
    if (formValues.poLine) updateData.po_line = formValues.poLine;
    if (formValues.isStockItem !== undefined) updateData.is_stock_item = formValues.isStockItem;
    if (formValues.notesInternal) updateData.notes_internal = formValues.notesInternal;
    if (formValues.installDate) updateData.install_date = formValues.installDate;
    if (formValues.installedBy) updateData.installed_by = formValues.installedBy;
    if (formValues.inventoryItemId) updateData.inventory_item_id = formValues.inventoryItemId;
    if (formValues.attachments) updateData.attachments = formValues.attachments;

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

    // Transform response to match WorkOrderPart interface
    const totalPrice = (data.customer_price || 0) * (data.quantity || 0);
    
    return {
      id: data.id,
      work_order_id: data.work_order_id,
      job_line_id: data.job_line_id,
      part_number: data.part_number,
      name: data.part_name || '',
      description: data.notes_internal || '',
      quantity: data.quantity,
      unit_price: data.customer_price,
      total_price: totalPrice,
      status: data.status,
      notes: data.notes,
      created_at: data.created_at,
      updated_at: data.updated_at,
      
      // Additional properties
      partName: data.part_name,
      partNumber: data.part_number,
      supplierName: data.supplier_name,
      supplierCost: data.supplier_cost,
      supplierSuggestedRetailPrice: data.supplier_suggested_retail_price,
      customerPrice: data.customer_price,
      retailPrice: data.retail_price,
      category: data.category,
      warrantyDuration: data.warranty_duration,
      warrantyExpiryDate: data.warranty_expiry_date,
      installDate: data.install_date,
      dateAdded: data.date_added,
      partType: data.part_type,
      installedBy: data.installed_by,
      markupPercentage: data.markup_percentage,
      inventoryItemId: data.inventory_item_id,
      coreChargeApplied: data.core_charge_applied,
      coreChargeAmount: data.core_charge_amount,
      isTaxable: data.is_taxable,
      invoiceNumber: data.invoice_number,
      poLine: data.po_line,
      isStockItem: data.is_stock_item,
      notesInternal: data.notes_internal,
      attachments: data.attachments,
      
      // CamelCase aliases
      workOrderId: data.work_order_id,
      jobLineId: data.job_line_id
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
