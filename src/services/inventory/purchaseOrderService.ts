
import { supabase } from '@/lib/supabase';

// Get all purchase orders
export async function getAllPurchaseOrders() {
  try {
    const { data, error } = await supabase
      .from('inventory_purchase_orders')
      .select('*, inventory_purchase_order_items(*)')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching purchase orders:', error);
    return [];
  }
}

// Create a new purchase order
export async function createPurchaseOrder(orderData: any) {
  try {
    // First create the purchase order
    const { data: order, error: orderError } = await supabase
      .from('inventory_purchase_orders')
      .insert(orderData)
      .select()
      .single();
      
    if (orderError) throw orderError;
    return order;
  } catch (error) {
    console.error('Error creating purchase order:', error);
    return null;
  }
}
