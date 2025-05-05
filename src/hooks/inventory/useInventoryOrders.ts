
import { useState, useCallback } from "react";
import { InventoryOrder, CreateInventoryOrderDto, UpdateInventoryOrderDto, ReceiveInventoryOrderDto } from "@/types/inventory/orders";
import { 
  getInventoryOrders, 
  getInventoryOrderById,
  createInventoryOrder,
  updateInventoryOrder,
  receiveInventoryOrder,
  cancelInventoryOrder,
  getOverdueOrders
} from "@/services/inventory/orderService";
import { toast } from "@/hooks/use-toast";

export function useInventoryOrders() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orders, setOrders] = useState<InventoryOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<InventoryOrder | null>(null);
  const [overdueOrders, setOverdueOrders] = useState<InventoryOrder[]>([]);

  // Load all inventory orders
  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getInventoryOrders();
      setOrders(data);
      return data;
    } catch (err) {
      const errorMessage = "Failed to load inventory orders";
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
  }, []);

  // Load overdue orders
  const loadOverdueOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getOverdueOrders();
      setOverdueOrders(data);
      return data;
    } catch (err) {
      const errorMessage = "Failed to load overdue orders";
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
  }, []);

  // Load a specific inventory order
  const loadOrder = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getInventoryOrderById(id);
      setSelectedOrder(data);
      return data;
    } catch (err) {
      const errorMessage = `Failed to load order ${id}`;
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
  }, []);

  // Create a new inventory order
  const addOrder = useCallback(async (order: CreateInventoryOrderDto) => {
    setLoading(true);
    setError(null);
    try {
      const result = await createInventoryOrder(order);
      toast({
        title: "Order Created",
        description: "Inventory order has been created successfully",
        variant: "default",
      });
      await loadOrders();
      return result;
    } catch (err) {
      const errorMessage = "Failed to create inventory order";
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
  }, [loadOrders]);

  // Update an existing inventory order
  const updateOrder = useCallback(async (id: string, updates: UpdateInventoryOrderDto) => {
    setLoading(true);
    setError(null);
    try {
      const result = await updateInventoryOrder(id, updates);
      toast({
        title: "Order Updated",
        description: "Inventory order has been updated successfully",
        variant: "default",
      });
      await loadOrders();
      return result;
    } catch (err) {
      const errorMessage = `Failed to update order ${id}`;
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
  }, [loadOrders]);

  // Receive items for an order
  const receiveItems = useCallback(async (params: ReceiveInventoryOrderDto) => {
    setLoading(true);
    setError(null);
    try {
      const result = await receiveInventoryOrder(params);
      toast({
        title: "Items Received",
        description: "Inventory has been updated successfully",
        variant: "default",
      });
      await loadOrders();
      return result;
    } catch (err: any) {
      const errorMessage = `Failed to receive items: ${err.message || "Unknown error"}`;
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
  }, [loadOrders]);

  // Cancel an inventory order
  const cancelOrder = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await cancelInventoryOrder(id);
      toast({
        title: "Order Cancelled",
        description: "Inventory order has been cancelled",
        variant: "default",
      });
      await loadOrders();
      return result;
    } catch (err) {
      const errorMessage = `Failed to cancel order ${id}`;
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
  }, [loadOrders]);

  return {
    loading,
    error,
    orders,
    selectedOrder,
    overdueOrders,
    loadOrders,
    loadOrder,
    addOrder,
    updateOrder,
    receiveItems,
    cancelOrder,
    loadOverdueOrders,
  };
}
