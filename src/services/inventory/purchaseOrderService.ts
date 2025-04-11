
import { supabase } from "@/lib/supabase";
import { 
  PurchaseOrder, 
  PurchaseOrderItem, 
  CreatePurchaseOrderDto,
  UpdatePurchaseOrderDto 
} from "@/types/inventory/purchaseOrders";
import { handleApiError } from "@/utils/errorHandling";
import { createInventoryTransaction } from "./transactionService";

export async function getPurchaseOrders(): Promise<PurchaseOrder[]> {
  try {
    const { data, error } = await supabase
      .from("inventory_purchase_orders")
      .select("*, inventory_vendors(name, contact_name)")
      .order("order_date", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    handleApiError(error, "Failed to fetch purchase orders");
    return [];
  }
}

export async function getPurchaseOrderById(id: string): Promise<PurchaseOrder | null> {
  try {
    const { data, error } = await supabase
      .from("inventory_purchase_orders")
      .select("*, inventory_vendors(name, contact_name)")
      .eq("id", id)
      .single();

    if (error) throw error;
    
    // Now get the items for this purchase order
    const { data: itemsData, error: itemsError } = await supabase
      .from("inventory_purchase_order_items")
      .select("*, inventory_items(name, sku)")
      .eq("purchase_order_id", id);
      
    if (itemsError) throw itemsError;
    
    // Map the items to include inventory item details
    const items = itemsData.map(item => ({
      ...item,
      item_name: item.inventory_items?.name,
      item_sku: item.inventory_items?.sku
    }));
    
    return { ...data, items };
  } catch (error) {
    handleApiError(error, `Failed to fetch purchase order ${id}`);
    return null;
  }
}

export async function createPurchaseOrder(purchaseOrder: CreatePurchaseOrderDto): Promise<PurchaseOrder | null> {
  try {
    // Begin a transaction
    const { data, error } = await supabase.rpc('create_purchase_order_transaction', {
      vendor_id: purchaseOrder.vendor_id,
      expected_delivery_date: purchaseOrder.expected_delivery_date,
      notes: purchaseOrder.notes,
      items: purchaseOrder.items
    });

    if (error) throw error;
    return data;
  } catch (error) {
    // If Supabase RPC isn't available, fallback to manual transaction
    try {
      // Calculate total amount
      const totalAmount = purchaseOrder.items.reduce(
        (sum, item) => sum + (item.quantity * item.unit_price), 
        0
      );

      // Start a transaction
      // Create the purchase order
      const { data: orderData, error: orderError } = await supabase
        .from("inventory_purchase_orders")
        .insert({
          vendor_id: purchaseOrder.vendor_id,
          expected_delivery_date: purchaseOrder.expected_delivery_date,
          notes: purchaseOrder.notes,
          total_amount: totalAmount
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create the purchase order items
      const orderItems = purchaseOrder.items.map(item => ({
        purchase_order_id: orderData.id,
        inventory_item_id: item.inventory_item_id,
        quantity: item.quantity,
        quantity_received: 0,
        unit_price: item.unit_price,
        total_price: item.quantity * item.unit_price
      }));

      const { error: itemsError } = await supabase
        .from("inventory_purchase_order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Return the created purchase order with items
      return await getPurchaseOrderById(orderData.id);
    } catch (fallbackError) {
      handleApiError(fallbackError, "Failed to create purchase order");
      return null;
    }
  }
}

export async function updatePurchaseOrder(
  id: string, 
  updates: UpdatePurchaseOrderDto
): Promise<PurchaseOrder | null> {
  try {
    const { data, error } = await supabase
      .from("inventory_purchase_orders")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    handleApiError(error, `Failed to update purchase order ${id}`);
    return null;
  }
}

export async function receivePurchaseOrderItems(
  orderId: string,
  receivedItems: Array<{ id: string, quantity_received: number }>
): Promise<boolean> {
  try {
    // Get the current purchase order
    const purchaseOrder = await getPurchaseOrderById(orderId);
    if (!purchaseOrder) throw new Error("Purchase order not found");
    
    // Update each received item
    for (const item of receivedItems) {
      // Update the item received quantity
      const { error: updateError } = await supabase
        .from("inventory_purchase_order_items")
        .update({ quantity_received: item.quantity_received })
        .eq("id", item.id);
        
      if (updateError) throw updateError;
      
      // Find the item to get its details
      const poItem = purchaseOrder.items?.find(i => i.id === item.id);
      if (!poItem) continue;
      
      // Create an inventory transaction for this received item
      await createInventoryTransaction({
        inventory_item_id: poItem.inventory_item_id,
        transaction_type: "purchase",
        quantity: item.quantity_received,
        reference_type: "purchase_order",
        reference_id: orderId,
        notes: `Received from PO #${orderId}`
      });
    }
    
    // Check if all items are received
    const { data: updatedItems, error: checkError } = await supabase
      .from("inventory_purchase_order_items")
      .select("quantity, quantity_received")
      .eq("purchase_order_id", orderId);
      
    if (checkError) throw checkError;
    
    // Determine if all items are fully received or partially received
    let allItemsReceived = true;
    let anyItemsReceived = false;
    
    for (const item of updatedItems) {
      if (item.quantity_received > 0) {
        anyItemsReceived = true;
      }
      if (item.quantity_received < item.quantity) {
        allItemsReceived = false;
      }
    }
    
    // Update the purchase order status
    const newStatus = allItemsReceived ? "received" : (anyItemsReceived ? "partially_received" : "submitted");
    await updatePurchaseOrder(orderId, { 
      status: newStatus as any,
      received_date: allItemsReceived ? new Date().toISOString() : undefined
    });
    
    return true;
  } catch (error) {
    handleApiError(error, `Failed to receive purchase order items for order ${orderId}`);
    return false;
  }
}

export async function cancelPurchaseOrder(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("inventory_purchase_orders")
      .update({ status: "cancelled" })
      .eq("id", id);
      
    if (error) throw error;
    return true;
  } catch (error) {
    handleApiError(error, `Failed to cancel purchase order ${id}`);
    return false;
  }
}
