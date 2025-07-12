import { supabase } from "@/integrations/supabase/client";
import { Order, OrderItem, CreateOrderRequest, UpdateOrderRequest } from "@/types/order";

/**
 * Create a new order from cart items
 */
export const createOrder = async (request: CreateOrderRequest): Promise<Order> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  // Calculate total amount
  const totalAmount = request.items.reduce((sum, item) => 
    sum + (item.unit_price * item.quantity), 0
  );

  // Create order
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: user.id,
      total_amount: totalAmount,
      shipping_address_id: request.shipping_address_id,
      billing_address_id: request.billing_address_id,
      shipping_method: request.shipping_method,
      notes: request.notes,
      status: "pending",
      payment_status: "unpaid"
    })
    .select()
    .single();

  if (orderError) throw orderError;

  // Create order items
  const orderItems = request.items.map(item => ({
    order_id: order.id,
    product_id: item.product_id,
    quantity: item.quantity,
    unit_price: item.unit_price,
    total_price: item.unit_price * item.quantity
  }));

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItems);

  if (itemsError) throw itemsError;

  return order;
};

/**
 * Get user's orders with items
 */
export const getUserOrders = async (): Promise<Order[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from("orders")
    .select(`
      *,
      items:order_items(
        *,
        product:products(
          id,
          name,
          image_url,
          sku
        )
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Order[];
};

/**
 * Get order by ID
 */
export const getOrderById = async (orderId: string): Promise<Order | null> => {
  const { data, error } = await supabase
    .from("orders")
    .select(`
      *,
      items:order_items(
        *,
        product:products(
          id,
          name,
          image_url,
          sku
        )
      )
    `)
    .eq("id", orderId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data as Order;
};

/**
 * Update order status
 */
export const updateOrder = async (orderId: string, updates: UpdateOrderRequest): Promise<Order> => {
  const { data, error } = await supabase
    .from("orders")
    .update(updates)
    .eq("id", orderId)
    .select()
    .single();

  if (error) throw error;
  return data as Order;
};

/**
 * Get all orders (admin)
 */
export const getAllOrders = async (): Promise<Order[]> => {
  const { data, error } = await supabase
    .from("orders")
    .select(`
      *,
      items:order_items(
        *,
        product:products(
          id,
          name,
          image_url,
          sku
        )
      )
    `)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Order[];
};

/**
 * Cancel order
 */
export const cancelOrder = async (orderId: string): Promise<Order> => {
  return updateOrder(orderId, { 
    status: "cancelled",
    payment_status: "refunded" 
  });
};