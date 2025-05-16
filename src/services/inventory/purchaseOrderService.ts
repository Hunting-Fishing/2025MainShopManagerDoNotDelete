
import { supabase } from "@/lib/supabase";
import { 
  InventoryPurchaseOrder, 
  InventoryPurchaseOrderItem 
} from "@/types/inventory/purchaseOrders";
import { recordInventoryTransaction } from "./transactionService";

interface OrderWithItems extends InventoryPurchaseOrder {
  items?: InventoryPurchaseOrderItem[];
}

export const createPurchaseOrder = async (order: Omit<OrderWithItems, 'id'>): Promise<InventoryPurchaseOrder> => {
  try {
    const { data, error } = await supabase
      .from('inventory_purchase_orders')
      .insert([{
        vendor_id: order.vendor_id,
        order_date: order.order_date,
        expected_delivery_date: order.expected_delivery_date,
        total_amount: order.total_amount,
        created_by: order.created_by,
        status: order.status || 'draft',
        notes: order.notes
      }])
      .select('*')
      .single();
      
    if (error) {
      throw error;
    }
    
    if (order.items && order.items.length > 0) {
      const orderItems = order.items.map(item => ({
        ...item,
        purchase_order_id: data.id
      }));
      
      const { error: itemsError } = await supabase
        .from('inventory_purchase_order_items')
        .insert(orderItems);
        
      if (itemsError) {
        throw itemsError;
      }
    }
    
    return {
      ...data,
      items: order.items || []
    };
  } catch (error) {
    console.error('Error creating purchase order:', error);
    throw error;
  }
};

export const getPurchaseOrders = async (): Promise<InventoryPurchaseOrder[]> => {
  try {
    const { data, error } = await supabase
      .from('inventory_purchase_orders')
      .select('*')
      .order('order_date', { ascending: false });
      
    if (error) {
      throw error;
    }
    
    const ordersWithItems = await Promise.all(data.map(async order => {
      const { data: items, error: itemsError } = await supabase
        .from('inventory_purchase_order_items')
        .select('*')
        .eq('purchase_order_id', order.id);
        
      if (itemsError) {
        throw itemsError;
      }
      
      return {
        ...order,
        items: items || []
      };
    }));
    
    return ordersWithItems;
  } catch (error) {
    console.error('Error fetching purchase orders:', error);
    return [];
  }
};

export const getPurchaseOrderById = async (id: string): Promise<InventoryPurchaseOrder | null> => {
  try {
    const { data, error } = await supabase
      .from('inventory_purchase_orders')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) {
      throw error;
    }
    
    const { data: items, error: itemsError } = await supabase
      .from('inventory_purchase_order_items')
      .select('*')
      .eq('purchase_order_id', id);
      
    if (itemsError) {
      throw itemsError;
    }
    
    return {
      ...data,
      items: items || []
    };
  } catch (error) {
    console.error(`Error fetching purchase order ${id}:`, error);
    return null;
  }
};

export const updatePurchaseOrder = async (order: InventoryPurchaseOrder): Promise<InventoryPurchaseOrder> => {
  try {
    const { data, error } = await supabase
      .from('inventory_purchase_orders')
      .update({
        vendor_id: order.vendor_id,
        expected_delivery_date: order.expected_delivery_date,
        total_amount: order.total_amount,
        status: order.status,
        notes: order.notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', order.id)
      .select('*')
      .single();
      
    if (error) {
      throw error;
    }
    
    // Update items - first delete existing items
    await supabase
      .from('inventory_purchase_order_items')
      .delete()
      .eq('purchase_order_id', order.id);
      
    // Then insert new items
    if (order.items && order.items.length > 0) {
      const orderItems = order.items.map(item => ({
        ...item,
        purchase_order_id: order.id
      }));
      
      await supabase
        .from('inventory_purchase_order_items')
        .insert(orderItems);
    }
    
    return {
      ...data,
      items: order.items || []
    };
  } catch (error) {
    console.error(`Error updating purchase order ${order.id}:`, error);
    throw error;
  }
};

export const receivePurchaseOrder = async (
  orderId: string, 
  receivedItems: InventoryPurchaseOrderItem[]
): Promise<InventoryPurchaseOrder | null> => {
  try {
    // Update the order status
    const { data, error } = await supabase
      .from('inventory_purchase_orders')
      .update({
        received_date: new Date().toISOString(),
        status: 'received',
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .select('*')
      .single();
      
    if (error) {
      throw error;
    }
    
    // Update the item quantities in inventory and record transactions
    for (const item of receivedItems) {
      // Update inventory quantity
      const { error: updateError } = await supabase
        .from('inventory_items')
        .update({
          quantity: supabase.rpc('increment_quantity', { 
            item_id: item.inventory_item_id,
            amount: item.quantity_received
          }),
          updated_at: new Date().toISOString()
        })
        .eq('id', item.inventory_item_id);
        
      if (updateError) {
        throw updateError;
      }
      
      // Record inventory transaction with proper parameters
      await recordInventoryTransaction({
        inventory_item_id: item.inventory_item_id,
        quantity: item.quantity_received,
        transaction_type: 'received',
        reference_id: orderId,
        reference_type: 'purchase_order',
        notes: `Received from purchase order ${orderId}`
      });
      
      // Update the received quantity in the order item
      await supabase
        .from('inventory_purchase_order_items')
        .update({
          quantity_received: item.quantity_received,
          updated_at: new Date().toISOString()
        })
        .eq('id', item.id);
    }
    
    return getPurchaseOrderById(orderId);
  } catch (error) {
    console.error(`Error receiving purchase order ${orderId}:`, error);
    throw error;
  }
};

export const cancelPurchaseOrder = async (orderId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('inventory_purchase_orders')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);
      
    if (error) {
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error(`Error cancelling purchase order ${orderId}:`, error);
    return false;
  }
};
