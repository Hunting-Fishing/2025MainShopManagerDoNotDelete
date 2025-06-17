
import { supabase } from '@/integrations/supabase/client';
import { WorkOrderPart } from '@/types/workOrderPart';

/**
 * Transform database row to WorkOrderPart interface
 */
function transformDbRowToPart(dbRow: any): WorkOrderPart {
  return {
    id: dbRow.id,
    work_order_id: dbRow.work_order_id,
    job_line_id: dbRow.job_line_id,
    part_number: dbRow.part_number,
    name: dbRow.part_name || dbRow.name || 'Unknown Part',
    description: dbRow.notes_internal || dbRow.description,
    quantity: dbRow.quantity || 1,
    unit_price: dbRow.customer_price || dbRow.unit_price || 0,
    total_price: (dbRow.customer_price || dbRow.unit_price || 0) * (dbRow.quantity || 1),
    status: dbRow.status,
    notes: dbRow.notes,
    created_at: dbRow.created_at,
    updated_at: dbRow.updated_at,
    
    // Additional properties
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
    binLocation: dbRow.warehouse_location,
    installDate: dbRow.install_date,
    dateAdded: dbRow.date_added || dbRow.created_at,
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
    shelfLocation: dbRow.shelf_location
  };
}

/**
 * Work order parts service
 */
export const workOrderPartsService = {
  /**
   * Get all parts for a work order
   */
  async getByWorkOrderId(workOrderId: string): Promise<WorkOrderPart[]> {
    try {
      const { data, error } = await supabase
        .from('work_order_parts')
        .select('*')
        .eq('work_order_id', workOrderId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return (data || []).map(transformDbRowToPart);
    } catch (error) {
      console.error('Error fetching work order parts:', error);
      throw error;
    }
  },

  /**
   * Get all parts for a specific job line
   */
  async getByJobLineId(jobLineId: string): Promise<WorkOrderPart[]> {
    try {
      const { data, error } = await supabase
        .from('work_order_parts')
        .select('*')
        .eq('job_line_id', jobLineId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return (data || []).map(transformDbRowToPart);
    } catch (error) {
      console.error('Error fetching job line parts:', error);
      throw error;
    }
  },

  /**
   * Create new part
   */
  async create(partData: Partial<WorkOrderPart>): Promise<WorkOrderPart> {
    try {
      // Map our WorkOrderPart type to database schema
      const dbData = {
        work_order_id: partData.work_order_id!,
        job_line_id: partData.job_line_id,
        part_number: partData.part_number || partData.partNumber || '',
        part_name: partData.name || partData.partName || 'Unknown Part',
        part_type: partData.partType || 'OEM',
        quantity: partData.quantity || 1,
        customer_price: partData.unit_price || partData.customerPrice || 0,
        supplier_name: partData.supplierName,
        supplier_cost: partData.supplierCost,
        supplier_suggested_retail_price: partData.supplierSuggestedRetailPrice,
        retail_price: partData.retailPrice,
        category: partData.category,
        warranty_duration: partData.warrantyDuration,
        install_date: partData.installDate,
        installed_by: partData.installedBy,
        markup_percentage: partData.markupPercentage,
        inventory_item_id: partData.inventoryItemId,
        core_charge_applied: partData.coreChargeApplied || false,
        core_charge_amount: partData.coreChargeAmount || 0,
        is_taxable: partData.isTaxable !== false,
        invoice_number: partData.invoiceNumber,
        po_line: partData.poLine,
        is_stock_item: partData.isStockItem !== false,
        notes: partData.notes,
        notes_internal: partData.notesInternal,
        status: partData.status || 'pending',
        warehouse_location: partData.warehouseLocation,
        shelf_location: partData.shelfLocation,
        attachments: partData.attachments
      };

      const { data, error } = await supabase
        .from('work_order_parts')
        .insert(dbData)
        .select()
        .single();

      if (error) throw error;
      return transformDbRowToPart(data);
    } catch (error) {
      console.error('Error creating work order part:', error);
      throw error;
    }
  },

  /**
   * Update part
   */
  async update(id: string, updates: Partial<WorkOrderPart>): Promise<WorkOrderPart> {
    try {
      // Map our WorkOrderPart type to database schema, only including defined values
      const dbUpdates: any = {};
      
      if (updates.part_number !== undefined) dbUpdates.part_number = updates.part_number;
      if (updates.name !== undefined) dbUpdates.part_name = updates.name;
      if (updates.partName !== undefined) dbUpdates.part_name = updates.partName;
      if (updates.partType !== undefined) dbUpdates.part_type = updates.partType;
      if (updates.quantity !== undefined) dbUpdates.quantity = updates.quantity;
      if (updates.unit_price !== undefined) dbUpdates.customer_price = updates.unit_price;
      if (updates.customerPrice !== undefined) dbUpdates.customer_price = updates.customerPrice;
      if (updates.supplierName !== undefined) dbUpdates.supplier_name = updates.supplierName;
      if (updates.supplierCost !== undefined) dbUpdates.supplier_cost = updates.supplierCost;
      if (updates.supplierSuggestedRetailPrice !== undefined) dbUpdates.supplier_suggested_retail_price = updates.supplierSuggestedRetailPrice;
      if (updates.retailPrice !== undefined) dbUpdates.retail_price = updates.retailPrice;
      if (updates.category !== undefined) dbUpdates.category = updates.category;
      if (updates.warrantyDuration !== undefined) dbUpdates.warranty_duration = updates.warrantyDuration;
      if (updates.installDate !== undefined) dbUpdates.install_date = updates.installDate;
      if (updates.installedBy !== undefined) dbUpdates.installed_by = updates.installedBy;
      if (updates.markupPercentage !== undefined) dbUpdates.markup_percentage = updates.markupPercentage;
      if (updates.inventoryItemId !== undefined) dbUpdates.inventory_item_id = updates.inventoryItemId;
      if (updates.coreChargeApplied !== undefined) dbUpdates.core_charge_applied = updates.coreChargeApplied;
      if (updates.coreChargeAmount !== undefined) dbUpdates.core_charge_amount = updates.coreChargeAmount;
      if (updates.isTaxable !== undefined) dbUpdates.is_taxable = updates.isTaxable;
      if (updates.invoiceNumber !== undefined) dbUpdates.invoice_number = updates.invoiceNumber;
      if (updates.poLine !== undefined) dbUpdates.po_line = updates.poLine;
      if (updates.isStockItem !== undefined) dbUpdates.is_stock_item = updates.isStockItem;
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
      if (updates.notesInternal !== undefined) dbUpdates.notes_internal = updates.notesInternal;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.warehouseLocation !== undefined) dbUpdates.warehouse_location = updates.warehouseLocation;
      if (updates.shelfLocation !== undefined) dbUpdates.shelf_location = updates.shelfLocation;
      if (updates.attachments !== undefined) dbUpdates.attachments = updates.attachments;

      // Always update the timestamp
      dbUpdates.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('work_order_parts')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return transformDbRowToPart(data);
    } catch (error) {
      console.error('Error updating work order part:', error);
      throw error;
    }
  },

  /**
   * Delete part
   */
  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('work_order_parts')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting work order part:', error);
      throw error;
    }
  }
};
