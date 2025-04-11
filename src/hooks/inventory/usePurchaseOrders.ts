
import { useState } from "react";
import { 
  getPurchaseOrders,
  getPurchaseOrderById,
  createPurchaseOrder,
  updatePurchaseOrder,
  receivePurchaseOrderItems,
  cancelPurchaseOrder
} from "@/services/inventory/purchaseOrderService";
import { 
  PurchaseOrder, 
  CreatePurchaseOrderDto, 
  UpdatePurchaseOrderDto 
} from "@/types/inventory/purchaseOrders";
import { toast } from "@/hooks/use-toast";

export function usePurchaseOrders() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);

  // Load all purchase orders
  const loadPurchaseOrders = async (): Promise<PurchaseOrder[]> => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPurchaseOrders();
      setPurchaseOrders(data);
      return data;
    } catch (err) {
      const errorMessage = "Failed to load purchase orders";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Load a specific purchase order
  const loadPurchaseOrder = async (id: string): Promise<PurchaseOrder | null> => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPurchaseOrderById(id);
      setSelectedOrder(data);
      return data;
    } catch (err) {
      const errorMessage = `Failed to load purchase order ${id}`;
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Create a new purchase order
  const addPurchaseOrder = async (order: CreatePurchaseOrderDto): Promise<PurchaseOrder | null> => {
    setLoading(true);
    setError(null);
    try {
      const result = await createPurchaseOrder(order);
      if (result) {
        toast({
          title: "Success",
          description: "Purchase order created successfully",
          variant: "default",
        });
        await loadPurchaseOrders(); // Refresh the purchase orders list
        return result;
      }
      return null;
    } catch (err) {
      const errorMessage = "Failed to create purchase order";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Update an existing purchase order
  const editPurchaseOrder = async (
    id: string, 
    updates: UpdatePurchaseOrderDto
  ): Promise<PurchaseOrder | null> => {
    setLoading(true);
    setError(null);
    try {
      const result = await updatePurchaseOrder(id, updates);
      if (result) {
        toast({
          title: "Success",
          description: "Purchase order updated successfully",
          variant: "default",
        });
        await loadPurchaseOrders(); // Refresh the purchase orders list
        return result;
      }
      return null;
    } catch (err) {
      const errorMessage = `Failed to update purchase order ${id}`;
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Receive items from a purchase order
  const receiveItems = async (
    orderId: string, 
    items: Array<{ id: string; quantity_received: number }>
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const result = await receivePurchaseOrderItems(orderId, items);
      if (result) {
        toast({
          title: "Success",
          description: "Items received successfully",
          variant: "default",
        });
        await loadPurchaseOrder(orderId); // Refresh the current purchase order
        await loadPurchaseOrders(); // Refresh the purchase orders list
        return true;
      }
      return false;
    } catch (err) {
      const errorMessage = "Failed to receive purchase order items";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Cancel a purchase order
  const cancelOrder = async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const result = await cancelPurchaseOrder(id);
      if (result) {
        toast({
          title: "Success",
          description: "Purchase order cancelled successfully",
          variant: "default",
        });
        await loadPurchaseOrders(); // Refresh the purchase orders list
        return true;
      }
      return false;
    } catch (err) {
      const errorMessage = `Failed to cancel purchase order ${id}`;
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    purchaseOrders,
    selectedOrder,
    loadPurchaseOrders,
    loadPurchaseOrder,
    addPurchaseOrder,
    editPurchaseOrder,
    receiveItems,
    cancelOrder,
  };
}
