import { useState, useCallback } from "react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { 
  InventoryPurchaseOrder, 
  InventoryPurchaseOrderItem 
} from "@/types/inventory/purchaseOrders";

// Define a complete Purchase Order type that includes items array
interface CompletePurchaseOrder extends InventoryPurchaseOrder {
  items: InventoryPurchaseOrderItem[];
}

export const usePurchaseOrders = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isReceiving, setIsReceiving] = useState(false);

  // Modified to accept a complete order with items
  const createPurchaseOrder = async (order: Omit<CompletePurchaseOrder, 'id'>) => {
    try {
      setIsCreating(true);
      
      // Create purchase order record
      const { data: poData, error: poError } = await supabase
        .from('inventory_purchase_orders')
        .insert({
          vendor_id: order.vendor_id,
          order_date: order.order_date,
          expected_delivery_date: order.expected_delivery_date,
          total_amount: order.total_amount,
          status: order.status,
          notes: order.notes,
          created_by: order.created_by
        })
        .select()
        .single();
      
      if (poError) throw poError;
      
      // Create purchase order items
      if (order.items && order.items.length > 0) {
        const poItems = order.items.map(item => ({
          purchase_order_id: poData.id,
          inventory_item_id: item.inventory_item_id,
          quantity: item.quantity,
          quantity_received: 0,
          unit_price: item.unit_price,
          total_price: item.total_price
        }));
        
        const { error: itemsError } = await supabase
          .from('inventory_purchase_order_items')
          .insert(poItems);
        
        if (itemsError) throw itemsError;
      }
      
      toast({
        title: "Purchase Order Created",
        description: `Purchase order #${poData.id} has been created successfully.`,
      });
      
      return poData;
    } catch (error) {
      console.error("Error creating purchase order:", error);
      toast({
        title: "Error",
        description: "Failed to create purchase order",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsCreating(false);
    }
  };
  
  const updatePurchaseOrder = async (id: string, updates: Partial<PurchaseOrder>) => {
    try {
      setIsUpdating(true);
      
      const { data, error } = await supabase
        .from('inventory_purchase_orders')
        .update({
          vendor_id: updates.vendor_id,
          expected_delivery_date: updates.expected_delivery_date,
          status: updates.status,
          notes: updates.notes
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      toast({
        title: "Purchase Order Updated",
        description: `Purchase order #${id} has been updated successfully.`,
      });
      
      return data;
    } catch (error) {
      console.error("Error updating purchase order:", error);
      toast({
        title: "Error",
        description: "Failed to update purchase order",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };
  
  const deletePurchaseOrder = async (id: string) => {
    try {
      setIsDeleting(true);
      
      // Delete items first due to foreign key constraints
      const { error: itemsError } = await supabase
        .from('inventory_purchase_order_items')
        .delete()
        .eq('purchase_order_id', id);
      
      if (itemsError) throw itemsError;
      
      // Then delete the purchase order
      const { error } = await supabase
        .from('inventory_purchase_orders')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Purchase Order Deleted",
        description: `Purchase order #${id} has been deleted successfully.`,
      });
      
      return true;
    } catch (error) {
      console.error("Error deleting purchase order:", error);
      toast({
        title: "Error",
        description: "Failed to delete purchase order",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsDeleting(false);
    }
  };
  
  const receivePurchaseOrder = async (orderId: string) => {
    try {
      setIsReceiving(true);
      
      // 1. Get the purchase order and items
      const { data: poItems, error: poItemsError } = await supabase
        .from('inventory_purchase_order_items')
        .select('*, inventory_item:inventory_item_id(id, quantity)')
        .eq('purchase_order_id', orderId);
      
      if (poItemsError) throw poItemsError;
      
      // 2. Update inventory quantities
      for (const item of poItems) {
        // Update inventory item quantity
        const { error: updateError } = await supabase
          .from('inventory_items')
          .update({
            quantity: item.inventory_item.quantity + (item.quantity - item.quantity_received),
            updated_at: new Date().toISOString()
          })
          .eq('id', item.inventory_item_id);
        
        if (updateError) throw updateError;
        
        // Update item to fully received
        const { error: receiveError } = await supabase
          .from('inventory_purchase_order_items')
          .update({
            quantity_received: item.quantity,
            updated_at: new Date().toISOString()
          })
          .eq('id', item.id);
        
        if (receiveError) throw receiveError;
      }
      
      // 3. Update purchase order status
      const { error: poUpdateError } = await supabase
        .from('inventory_purchase_orders')
        .update({
          status: 'received',
          received_date: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);
      
      if (poUpdateError) throw poUpdateError;
      
      toast({
        title: "Purchase Order Received",
        description: `Purchase order #${orderId} has been received successfully.`,
      });
      
      return true;
    } catch (error) {
      console.error("Error receiving purchase order:", error);
      toast({
        title: "Error",
        description: "Failed to receive purchase order",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsReceiving(false);
    }
  };
  
  return {
    isCreating,
    isUpdating,
    isDeleting,
    isReceiving,
    createPurchaseOrder,
    updatePurchaseOrder,
    deletePurchaseOrder,
    receivePurchaseOrder
  };
};
