import { WorkOrderPart } from '@/types/workOrderPart';
import { WorkOrderJobLine } from '@/types/jobLine';

/**
 * Maps form data to work_order_parts database schema
 */
export const mapPartFormToDatabase = (formData: any, workOrderId: string, jobLineId?: string) => {
  const quantity = formData.quantity || 1;
  const customerPrice = formData.unit_price || formData.customerPrice || 0;
  
  return {
    work_order_id: workOrderId,
    job_line_id: jobLineId || null,
    part_name: formData.name, // Map name to part_name for database
    part_number: formData.part_number,
    quantity: quantity,
    customer_price: customerPrice, // This is the required field in database
    supplier_cost: formData.supplierCost || 0,
    retail_price: formData.retailPrice || 0,
    supplier_name: formData.supplierName || '',
    category: formData.category || '',
    part_type: formData.part_type || 'inventory', // Required field
    markup_percentage: formData.markupPercentage || 0,
    is_taxable: formData.isTaxable !== undefined ? formData.isTaxable : true,
    core_charge_amount: formData.coreChargeAmount || 0,
    core_charge_applied: formData.coreChargeApplied || false,
    warranty_duration: formData.warrantyDuration || '',
    invoice_number: formData.invoiceNumber || '',
    po_line: formData.poLine || '',
    is_stock_item: formData.isStockItem || false,
    notes: formData.notes || formData.description || '',
    status: formData.status || 'pending',
    // Calculate total price dynamically
    total_price: quantity * customerPrice
  };
};

/**
 * Maps form data to work_order_job_lines database schema
 */
export const mapJobLineFormToDatabase = (formData: any, workOrderId: string, displayOrder: number = 0) => {
  return {
    work_order_id: workOrderId,
    name: formData.name,
    category: formData.category || '',
    subcategory: formData.subcategory || '',
    description: formData.description || '',
    estimated_hours: formData.estimated_hours || 0,
    labor_rate: formData.labor_rate || 0,
    labor_rate_type: formData.labor_rate_type || 'standard',
    total_amount: formData.total_amount || (formData.estimated_hours * formData.labor_rate),
    status: formData.status || 'pending',
    display_order: displayOrder,
    notes: formData.notes || ''
  };
};

/**
 * Maps database result to WorkOrderPart type
 */
export const mapDatabaseToPart = (dbData: any): WorkOrderPart => {
  const quantity = dbData.quantity || 1;
  const unitPrice = dbData.customer_price || 0;
  
  return {
    id: dbData.id,
    work_order_id: dbData.work_order_id,
    job_line_id: dbData.job_line_id,
    part_number: dbData.part_number,
    name: dbData.part_name || dbData.name, // Handle both field names
    partName: dbData.part_name,
    description: dbData.notes || dbData.description,
    quantity: quantity,
    unit_price: unitPrice,
    total_price: dbData.total_price || (quantity * unitPrice), // Use database value or calculate
    status: dbData.status,
    notes: dbData.notes,
    created_at: dbData.created_at,
    updated_at: dbData.updated_at,
    // Additional fields
    category: dbData.category,
    customerPrice: dbData.customer_price,
    supplierCost: dbData.supplier_cost,
    retailPrice: dbData.retail_price,
    supplierName: dbData.supplier_name,
    part_type: dbData.part_type, // Fix field name
    markupPercentage: dbData.markup_percentage,
    isTaxable: dbData.is_taxable,
    coreChargeAmount: dbData.core_charge_amount,
    coreChargeApplied: dbData.core_charge_applied,
    warrantyDuration: dbData.warranty_duration,
    invoiceNumber: dbData.invoice_number,
    poLine: dbData.po_line,
    isStockItem: dbData.is_stock_item,
    // Map additional fields that might be missing
    supplierSuggestedRetailPrice: dbData.supplier_suggested_retail_price,
    dateAdded: dbData.date_added,
    binLocation: dbData.bin_location,
    warehouseLocation: dbData.warehouse_location,
    shelfLocation: dbData.shelf_location,
    attachments: dbData.attachments,
    warrantyExpiryDate: dbData.warranty_expiry_date,
    installDate: dbData.install_date,
    installedBy: dbData.installed_by,
    notesInternal: dbData.notes_internal,
    inventoryItemId: dbData.inventory_item_id,
    estimatedArrivalDate: dbData.estimated_arrival_date,
    itemStatus: dbData.item_status,
    supplierOrderRef: dbData.supplier_order_ref
  };
};

/**
 * Maps database result to WorkOrderJobLine type
 */
export const mapDatabaseToJobLine = (dbData: any): WorkOrderJobLine => {
  return {
    id: dbData.id,
    work_order_id: dbData.work_order_id,
    name: dbData.name,
    category: dbData.category,
    subcategory: dbData.subcategory,
    description: dbData.description,
    estimated_hours: dbData.estimated_hours,
    labor_rate: dbData.labor_rate,
    labor_rate_type: dbData.labor_rate_type,
    total_amount: dbData.total_amount,
    status: dbData.status,
    display_order: dbData.display_order,
    notes: dbData.notes,
    created_at: dbData.created_at,
    updated_at: dbData.updated_at
  };
};
