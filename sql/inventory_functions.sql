
-- Create function to update inventory quantity
CREATE OR REPLACE FUNCTION update_inventory_quantity(item_id UUID, quantity_change INTEGER)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  current_quantity INTEGER;
BEGIN
  -- Get current quantity
  SELECT quantity INTO current_quantity 
  FROM inventory_items 
  WHERE id = item_id;
  
  -- Check if item exists
  IF current_quantity IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Special check for negative inventory when reducing quantity
  IF quantity_change < 0 AND ABS(quantity_change) > current_quantity THEN
    -- Don't allow negative inventory (set to 0 instead)
    UPDATE inventory_items
    SET quantity = 0,
        updated_at = NOW()
    WHERE id = item_id;
  ELSE
    -- Normal update
    UPDATE inventory_items
    SET quantity = quantity + quantity_change,
        updated_at = NOW()
    WHERE id = item_id;
  END IF;
  
  -- Create inventory transaction record
  INSERT INTO inventory_transactions (
    inventory_item_id,
    quantity,
    transaction_type
  ) VALUES (
    item_id,
    ABS(quantity_change),
    CASE WHEN quantity_change > 0 THEN 'addition' ELSE 'reduction' END
  );
  
  RETURN TRUE;
END;
$$;
