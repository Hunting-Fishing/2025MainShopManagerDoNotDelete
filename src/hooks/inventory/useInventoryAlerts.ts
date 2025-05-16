
import { useState, useEffect, useCallback } from 'react';
import { useNotifications } from '@/context/notifications';

// Mock inventory data
const mockInventory = [
  { id: '1', name: 'Oil Filter', stock: 2, minLevel: 5 },
  { id: '2', name: 'Air Filter', stock: 0, minLevel: 10 },
  { id: '3', name: 'Brake Pads', stock: 3, minLevel: 4 },
  { id: '4', name: 'Wiper Blades', stock: 8, minLevel: 5 },
  { id: '5', name: 'Engine Oil', stock: 0, minLevel: 8 },
];

export function useInventoryAlerts() {
  const [lowStockItems, setLowStockItems] = useState<any[]>([]);
  const [outOfStockItems, setOutOfStockItems] = useState<any[]>([]);
  const { addNotification } = useNotifications();

  // Check inventory levels
  const checkInventoryAlerts = useCallback(() => {
    const lowStock: any[] = [];
    const outOfStock: any[] = [];
    
    // In a real app, this would fetch from your database
    mockInventory.forEach(item => {
      if (item.stock === 0) {
        outOfStock.push(item);
      } else if (item.stock < item.minLevel) {
        lowStock.push(item);
      }
    });
    
    setLowStockItems(lowStock);
    setOutOfStockItems(outOfStock);
    
    // Send notification if there are out of stock items
    if (outOfStock.length > 0) {
      addNotification({
        title: "Inventory Alert",
        message: `${outOfStock.length} items are out of stock and need attention.`,
        type: "warning",
        category: "inventory",
        priority: "high",
        link: "/inventory?filter=outOfStock"
      });
    }
    
    // Send notification if there are low stock items
    if (lowStock.length > 0) {
      addNotification({
        title: "Inventory Notice",
        message: `${lowStock.length} items are running low on stock.`,
        type: "info",
        category: "inventory",
        priority: "medium",
        link: "/inventory?filter=lowStock"
      });
    }
  }, [addNotification]);

  // Run check on component mount
  useEffect(() => {
    checkInventoryAlerts();
    
    // Set up interval to check periodically (every hour in a real app)
    const interval = setInterval(checkInventoryAlerts, 3600000);
    
    return () => clearInterval(interval);
  }, [checkInventoryAlerts]);

  return {
    lowStockItems,
    outOfStockItems,
    checkInventoryAlerts
  };
}
