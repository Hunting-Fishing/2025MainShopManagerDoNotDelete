
import { useState, useEffect, useCallback } from 'react';
import { 
  getLowStockItems, 
  getOutOfStockItems 
} from '@/services/inventoryService';
import { InventoryItemExtended, AutoReorderSettings } from '@/types/inventory';
import { toast } from '@/hooks/use-toast';

export function useInventoryManager() {
  const [lowStockItems, setLowStockItems] = useState<InventoryItemExtended[]>([]);
  const [outOfStockItems, setOutOfStockItems] = useState<InventoryItemExtended[]>([]);
  const [autoReorderSettings, setAutoReorderSettings] = useState<AutoReorderSettings>({
    enabled: false,
    threshold: 5,
    quantity: 10
  });
  const [loading, setLoading] = useState(false);

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

  return {
    lowStockItems,
    outOfStockItems,
    autoReorderSettings,
    loading,
    checkInventoryAlerts,
    consumeWorkOrderInventory,
    reserveInventory
  };
}
