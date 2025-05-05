
import { supabase } from "@/lib/supabase";
import { InventoryOrder, CreateInventoryOrderDto, UpdateInventoryOrderDto, ReceiveInventoryOrderDto } from "@/types/inventory/orders";

// Get all inventory orders
export const getInventoryOrders = async (): Promise<InventoryOrder[]> => {
  const { data, error } = await supabase
    .from('inventory_orders')
    .select(`
      *,
      inventory_items (id, name)
    `)
    .order('order_date', { ascending: false });

  if (error) {
    console.error("Error fetching inventory orders:", error);
    throw error;
  }

  // Format the data to include the item name
  return data.map(order => ({
    ...order,
    item_name: order.inventory_items?.name
  }));
};

// Get inventory order by ID
export const getInventoryOrderById = async (id: string): Promise<InventoryOrder> => {
  const { data, error } = await supabase
    .from('inventory_orders')
    .select(`
      *,
      inventory_items (id, name)
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching inventory order ${id}:`, error);
    throw error;
  }

  return {
    ...data,
    item_name: data.inventory_items?.name
  };
};

// Create inventory order
export const createInventoryOrder = async (order: CreateInventoryOrderDto): Promise<InventoryOrder> => {
  const { data, error } = await supabase
    .from('inventory_orders')
    .insert(order)
    .select()
    .single();

  if (error) {
    console.error("Error creating inventory order:", error);
    throw error;
  }

  return data;
};

// Update inventory order
export const updateInventoryOrder = async (id: string, updates: UpdateInventoryOrderDto): Promise<InventoryOrder> => {
  const { data, error } = await supabase
    .from('inventory_orders')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating inventory order ${id}:`, error);
    throw error;
  }

  return data;
};

// Receive inventory
export const receiveInventoryOrder = async ({ order_id, quantity_to_receive }: ReceiveInventoryOrderDto): Promise<boolean> => {
  const { data, error } = await supabase
    .rpc('receive_inventory_order', {
      order_id,
      quantity_to_receive
    });

  if (error) {
    console.error("Error receiving inventory:", error);
    throw error;
  }

  return true;
};

// Cancel inventory order
export const cancelInventoryOrder = async (id: string): Promise<InventoryOrder> => {
  const { data, error } = await supabase
    .from('inventory_orders')
    .update({ status: 'cancelled' })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error cancelling inventory order ${id}:`, error);
    throw error;
  }

  return data;
};

// Get overdue orders (expected arrival date in the past and not fully received)
export const getOverdueOrders = async (): Promise<InventoryOrder[]> => {
  const today = new Date().toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('inventory_orders')
    .select(`
      *,
      inventory_items (id, name)
    `)
    .lt('expected_arrival', today)
    .neq('status', 'received')
    .neq('status', 'cancelled')
    .order('expected_arrival', { ascending: true });

  if (error) {
    console.error("Error fetching overdue orders:", error);
    throw error;
  }

  return data.map(order => ({
    ...order,
    item_name: order.inventory_items?.name
  }));
};
