
-- Job Line Parts Procedures - Functions to load job lines with associated parts

-- Create function to get work order job lines with their associated parts
CREATE OR REPLACE FUNCTION get_work_order_job_lines_with_parts(work_order_id_param uuid)
RETURNS TABLE (
  id uuid,
  work_order_id uuid,
  name text,
  category text,
  subcategory text,
  description text,
  estimated_hours numeric,
  labor_rate numeric,
  total_amount numeric,
  status text,
  notes text,
  display_order integer,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  parts jsonb
) LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT 
    jl.id,
    jl.work_order_id,
    jl.name,
    jl.category,
    jl.subcategory,
    jl.description,
    jl.estimated_hours,
    jl.labor_rate,
    jl.total_amount,
    jl.status,
    jl.notes,
    jl.display_order,
    jl.created_at,
    jl.updated_at,
    COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'id', p.id,
          'workOrderId', p.work_order_id,
          'jobLineId', p.job_line_id,
          'inventoryItemId', p.inventory_item_id,
          'partName', p.part_name,
          'partNumber', p.part_number,
          'supplierName', p.supplier_name,
          'supplierCost', p.supplier_cost,
          'supplierSuggestedRetailPrice', p.supplier_suggested_retail_price,
          'markupPercentage', p.markup_percentage,
          'retailPrice', p.retail_price,
          'customerPrice', p.customer_price,
          'quantity', p.quantity,
          'partType', p.part_type,
          'invoiceNumber', p.invoice_number,
          'poLine', p.po_line,
          'notes', p.notes,
          'category', p.category,
          'isTaxable', p.is_taxable,
          'coreChargeAmount', p.core_charge_amount,
          'coreChargeApplied', p.core_charge_applied,
          'warrantyDuration', p.warranty_duration,
          'warrantyExpiryDate', p.warranty_expiry_date,
          'installDate', p.install_date,
          'installedBy', p.installed_by,
          'status', p.status,
          'isStockItem', p.is_stock_item,
          'dateAdded', p.created_at,
          'attachments', COALESCE(p.attachments, '{}'),
          'notesInternal', p.notes_internal,
          'createdAt', p.created_at,
          'updatedAt', p.updated_at
        )
      ) FILTER (WHERE p.id IS NOT NULL),
      '[]'::jsonb
    ) as parts
  FROM work_order_job_lines jl
  LEFT JOIN work_order_parts p ON jl.id = p.job_line_id
  WHERE jl.work_order_id = work_order_id_param
  GROUP BY jl.id, jl.work_order_id, jl.name, jl.category, jl.subcategory, 
           jl.description, jl.estimated_hours, jl.labor_rate, jl.total_amount,
           jl.status, jl.notes, jl.display_order, jl.created_at, jl.updated_at
  ORDER BY jl.display_order ASC, jl.created_at ASC;
END;
$$;
