
import { useState, useEffect } from 'react';
import { getInventoryItems, updateInventoryItem } from '@/services/inventory/crudService';
import { InventoryItemExtended } from '@/types/inventory';
import { useNotifications } from '@/context/notifications';
import { toast } from '@/hooks/use-toast';
import { 
  countLowStockItems, 
  countOutOfStockItems 
} from '@/utils/inventory/inventoryUtils';
import { useManualReorder } from './useManualReorder';

export interface AutoReorderSettings {
  enabled: boolean;
  threshold: number;
  quantity: number;
}

export const useInventoryManager = () => {
  const [lowStockItems, setLowStockItems] = useState<InventoryItemExtended[]>([]);
  const [outOfStockItems, setOutOfStockItems] = useState<InventoryItemExtended[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoReorderSettings, setAutoReorderSettings] = useState<Record<string, AutoReorderSettings>>({});
  const { addNotification } = useNotifications();
  const { reorderItem: manualReorder } = useManualReorder();
  
  const checkInventoryAlerts = async () => {
    setLoading(true);
    try {
      const items = await getInventoryItems();
      
      // Filter items for low stock and out of stock
      const lowStock = items.filter(item => {
        const quantity = Number(item.quantity);
        const reorderPoint = Number(item.reorder_point);
        return quantity > 0 && quantity <= reorderPoint;
      });
      
      const outOfStock = items.filter(item => {
        const quantity = Number(item.quantity);
        return quantity <= 0;
      });
      
      setLowStockItems(lowStock);
      setOutOfStockItems(outOfStock);
      setError(null);
    } catch (err) {
      setError('Failed to check inventory alerts');
      console.error('Error checking inventory alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  // Function to manually reorder an item
  const reorderItem = async (itemId: string, quantity: number) => {
    return await manualReorder(itemId, quantity);
  };

  // Function to enable auto-reordering for an item
  const enableAutoReorder = async (itemId: string, threshold: number, quantity: number) => {
    try {
      // In a real app, this would save to a database
      setAutoReorderSettings(prev => ({
        ...prev,
        [itemId]: { enabled: true, threshold, quantity }
      }));
      
      toast({
        title: "Auto-reorder enabled",
        description: `Auto-reorder has been enabled for this item when stock falls below ${threshold}`,
      });
      
      return true;
    } catch (error) {
      console.error("Error enabling auto-reorder:", error);
      toast({
        title: "Error",
        description: "Failed to enable auto-reorder",
        variant: "destructive",
      });
      return false;
    }
  };

  // Function to handle inventory reservation for work orders
  const reserveInventory = async (itemId: string, quantity: number) => {
    try {
      const item = await getInventoryItems().then(items => 
        items.find(item => item.id === itemId)
      );
      
      if (!item) return false;
      
      const currentQuantity = Number(item.quantity);
      if (currentQuantity < quantity) return false;
      
      // Update item with reduced quantity and increased onHold
      const updatedItem = {
        ...item,
        quantity: currentQuantity - quantity,
        onHold: (Number(item.onHold) || 0) + quantity
      };
      
      await updateInventoryItem(itemId, updatedItem);
      return true;
    } catch (error) {
      console.error("Error reserving inventory:", error);
      return false;
    }
  };

  // Function to handle inventory consumption for work orders
  const consumeWorkOrderInventory = async (workOrderId: string) => {
    // In a real implementation, this would find the items associated with the work order
    // and mark them as consumed
    console.log("Would consume inventory for work order:", workOrderId);
    return true;
  };
  
  useEffect(() => {
    checkInventoryAlerts();
  }, []);
  
  return {
    lowStockItems,
    outOfStockItems,
    lowStockCount: lowStockItems.length,
    outOfStockCount: outOfStockItems.length,
    checkInventoryAlerts,
    loading,
    error,
    reorderItem,
    enableAutoReorder,
    autoReorderSettings,
    reserveInventory,
    consumeWorkOrderInventory
  };
};
