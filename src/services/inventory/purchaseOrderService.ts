
import { supabase } from "@/lib/supabase";
import {
  InventoryPurchaseOrder,
  InventoryPurchaseOrderItem,
} from "@/types/inventory/purchaseOrders";

interface CreatePurchaseOrderInput {
  vendorId: string;
  items: Array<{
    inventory_item_id: string;
    quantity: number;
    unit_price: number;
  }>;
  expectedDeliveryDate?: string;
  notes?: string;
  createdBy?: string;
}

const mapOrder = (row: any): InventoryPurchaseOrder => ({
  id: row.id,
  vendor_id: row.supplier_id,
  order_date: row.order_date,
  expected_delivery_date: row.expected_delivery_date,
  received_date: row.received_date,
  total_amount: row.total_amount,
  created_by: row.created_by,
  created_at: row.created_at,
  updated_at: row.updated_at,
  status: row.status || "pending",
  notes: row.notes,
});

const mapItem = (row: any): InventoryPurchaseOrderItem => ({
  id: row.id,
  purchase_order_id: row.purchase_order_id,
  inventory_item_id: row.inventory_item_id,
  quantity: row.quantity,
  quantity_received: row.quantity_received || 0,
  unit_price: row.unit_price,
  total_price: row.total_price,
  created_at: row.created_at,
  updated_at: row.updated_at,
});

export async function createPurchaseOrder(
  input: CreatePurchaseOrderInput
): Promise<InventoryPurchaseOrder> {
  const totalAmount = input.items.reduce(
    (sum, item) => sum + item.quantity * item.unit_price,
    0
  );

  const { count } = await supabase
    .from("purchase_orders")
    .select("id", { count: "exact", head: true });

  const poNumber = `PO-${String((count || 0) + 1001).padStart(6, "0")}`;

  const { data: order, error } = await supabase
    .from("purchase_orders")
    .insert({
      po_number: poNumber,
      supplier_id: input.vendorId,
      order_date: new Date().toISOString(),
      expected_delivery_date: input.expectedDeliveryDate
        ? new Date(input.expectedDeliveryDate).toISOString()
        : null,
      total_amount: totalAmount,
      status: "pending",
      notes: input.notes,
      created_by: input.createdBy || null,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating purchase order:", error);
    throw error;
  }

  if (input.items.length > 0) {
    const itemsPayload = input.items.map((item) => ({
      purchase_order_id: order.id,
      inventory_item_id: item.inventory_item_id,
      quantity: item.quantity,
      quantity_received: 0,
      unit_price: item.unit_price,
      total_price: item.quantity * item.unit_price,
    }));

    const { error: itemsError } = await supabase
      .from("purchase_order_items")
      .insert(itemsPayload);

    if (itemsError) {
      console.error("Error creating purchase order items:", itemsError);
      throw itemsError;
    }
  }

  return mapOrder(order);
}

export async function getPurchaseOrders(): Promise<InventoryPurchaseOrder[]> {
  const { data, error } = await supabase
    .from("purchase_orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching purchase orders:", error);
    throw error;
  }

  return (data || []).map(mapOrder);
}

export async function getPurchaseOrderById(
  id: string
): Promise<InventoryPurchaseOrder | null> {
  const { data, error } = await supabase
    .from("purchase_orders")
    .select("*, purchase_order_items (*)")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching purchase order:", error);
    return null;
  }

  const order = mapOrder(data);
  return {
    ...order,
    items: (data.purchase_order_items || []).map(mapItem),
  };
}

export async function updatePurchaseOrderStatus(
  id: string,
  status: string,
  userId: string | null = null,
  notes: string | null = null
): Promise<{ success: boolean }> {
  const { error } = await supabase
    .from("purchase_orders")
    .update({
      status,
      notes,
      updated_at: new Date().toISOString(),
      created_by: userId || undefined,
    })
    .eq("id", id);

  if (error) {
    console.error("Error updating purchase order status:", error);
    throw error;
  }

  return { success: true };
}

export async function processOrders(orderIds: string[], status: string) {
  for (const id of orderIds) {
    await updatePurchaseOrderStatus(id, status);
  }
}
