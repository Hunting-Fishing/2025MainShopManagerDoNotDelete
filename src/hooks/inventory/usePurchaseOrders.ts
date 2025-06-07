
import { useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from "@/lib/supabase";
import { InventoryPurchaseOrder } from '@/types/inventory/purchaseOrders';

export const usePurchaseOrders = () => {
  const [orders, setOrders] = useState<InventoryPurchaseOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all purchase orders
  const fetchPurchaseOrders = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('inventory_purchase_orders')
        .select('*, inventory_purchase_order_items(*)');

      if (error) {
        throw new Error(error.message);
      }

      setOrders(data || []);
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Failed to load purchase orders",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new purchase order
  const createPurchaseOrder = useCallback(async (orderData: Partial<InventoryPurchaseOrder>) => {
    try {
      const { data, error } = await supabase
        .from('inventory_purchase_orders')
        .insert([orderData])
        .select()
        .single();

      if (error) throw new Error(error.message);
      
      toast({
        title: "Purchase order created",
        description: `Order #${data.id.substring(0, 8)} has been created.`
      });
      
      return data;
    } catch (err: any) {
      toast({
        title: "Failed to create purchase order",
        description: err.message,
        variant: "destructive"
      });
      throw err;
    }
  }, []);

  // Update an existing purchase order
  const updatePurchaseOrder = useCallback(async (id: string, updates: Partial<InventoryPurchaseOrder>) => {
    try {
      const { data, error } = await supabase
        .from('inventory_purchase_orders')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      
      toast({
        title: "Purchase order updated",
        description: `Order #${id.substring(0, 8)} has been updated.`
      });
      
      return data;
    } catch (err: any) {
      toast({
        title: "Failed to update purchase order",
        description: err.message,
        variant: "destructive"
      });
      throw err;
    }
  }, []);

  // Delete a purchase order
  const deletePurchaseOrder = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('inventory_purchase_orders')
        .delete()
        .eq('id', id);

      if (error) throw new Error(error.message);
      
      toast({
        title: "Purchase order deleted",
        description: `Order #${id.substring(0, 8)} has been deleted.`
      });
      
      return true;
    } catch (err: any) {
      toast({
        title: "Failed to delete purchase order",
        description: err.message,
        variant: "destructive"
      });
      throw err;
    }
  }, []);

  return {
    orders,
    loading,
    error,
    fetchPurchaseOrders,
    createPurchaseOrder,
    updatePurchaseOrder,
    deletePurchaseOrder
  };
};
