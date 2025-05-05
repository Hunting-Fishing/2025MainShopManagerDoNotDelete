
import { useState, useEffect, useCallback } from 'react';
import { 
  getLowStockItems, 
  getOutOfStockItems 
} from '@/services/inventoryService';
import { InventoryItemExtended } from '@/types/inventory';
import { toast } from '@/hooks/use-toast';
import { useManualReorder } from './useManualReorder';
import { useAutoReorder } from './useAutoReorder';

// Export this type from the hook
export interface AutoReorderSettings {
  enabled: boolean;
  threshold: number;
  quantity: number;
}

export function useInventoryManager() {
  const [lowStockItems, setLowStockItems] = useState<InventoryItemExtended[]>([]);
  const [outOfStockItems, setOutOfStockItems] = useState<InventoryItemExtended[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Use the sub-hooks for specific functionality
  const { reorderItem } = useManualReorder();
  const { 
    autoReorderSettings, 
    enableAutoReorder, 
    disableAutoReorder, 
    placeAutomaticOrder 
  } = useAutoReorder();

  // Function to check inventory alerts
  const checkInventoryAlerts = useCallback(async () => {
    setLoading(true);
    try {
      const [lowItems, outItems] = await Promise.all([
        getLowStockItems(),
        getOutOfStockItems()
      ]);
      
      setLowStockItems(lowItems);
      setOutOfStockItems(outItems);
    } catch (error) {
      console.error('Error checking inventory alerts:', error);
      toast({
        title: 'Error',
        description: 'Failed to check inventory status',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Check inventory alerts on component mount
  useEffect(() => {
    checkInventoryAlerts();
  }, [checkInventoryAlerts]);

  // Function to handle inventory for work orders
  const consumeWorkOrderInventory = useCallback(async (items: { id: string, quantity: number }[]) => {
    // This would connect to your inventory service to update quantities
    console.log('Consuming inventory for work order:', items);
    return true;
  }, []);

  // Function to reserve inventory for work orders
  const reserveInventory = useCallback(async (items: { id: string, quantity: number }[]) => {
    // This would connect to your inventory service to reserve quantities
    console.log('Reserving inventory for work order:', items);
    return true;
  }, []);
  
  // Function to check item availability for work orders
  const checkItemAvailability = useCallback(async (itemId: string, quantity: number) => {
    // Mock implementation - in a real app this would check against database
    console.log(`Checking availability for item ${itemId}, quantity ${quantity}`);
    
    // For demo purposes, we'll assume all items with quantity <= 5 are low stock
    const item = lowStockItems.find(item => item.id === itemId);
    if (item && item.quantity < quantity) {
      return {
        available: false,
        message: `Only ${item.quantity} units of ${item.name} available`,
        availableQuantity: item.quantity
      };
    }
    
    // Check if item is out of stock
    const outOfStockItem = outOfStockItems.find(item => item.id === itemId);
    if (outOfStockItem) {
      return {
        available: false,
        message: `${outOfStockItem.name} is out of stock`,
        availableQuantity: 0
      };
    }
    
    // If not in our alerts lists, assume it's available
    return {
      available: true,
      message: "Item is available"
    };
  }, [lowStockItems, outOfStockItems]);

  return {
    lowStockItems,
    outOfStockItems,
    autoReorderSettings,
    loading,
    checkInventoryAlerts,
    consumeWorkOrderInventory,
    reserveInventory,
    checkItemAvailability,
    reorderItem,
    enableAutoReorder,
    disableAutoReorder,
    placeAutomaticOrder
  };
}
