import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { InventoryItemExtended } from '@/types/inventory';
import { useInventoryData } from './useInventoryData';

interface InventoryAnalytics {
  totalValue: number;
  totalItems: number;
  lowStockItems: number;
  outOfStockItems: number;
  averageItemValue: number;
  topCategories: Array<{ category: string; count: number; value: number }>;
  topSuppliers: Array<{ supplier: string; count: number; value: number }>;
  stockTrends: Array<{ date: string; totalStock: number; totalValue: number }>;
  turnoverRate: number;
  monthlyMovement: Array<{ month: string; added: number; removed: number }>;
}

export function useInventoryAnalytics() {
  const { items, isLoading } = useInventoryData();

  const analytics = useMemo((): InventoryAnalytics => {
    if (!items.length) {
      return {
        totalValue: 0,
        totalItems: 0,
        lowStockItems: 0,
        outOfStockItems: 0,
        averageItemValue: 0,
        topCategories: [],
        topSuppliers: [],
        stockTrends: [],
        turnoverRate: 0,
        monthlyMovement: []
      };
    }

    // Basic metrics
    const totalItems = items.length;
    const totalValue = items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
    const averageItemValue = totalValue / totalItems;

    const lowStockItems = items.filter(item => {
      const quantity = Number(item.quantity) || 0;
      const reorderPoint = Number(item.reorder_point) || 0;
      return quantity > 0 && quantity <= reorderPoint;
    }).length;

    const outOfStockItems = items.filter(item => (Number(item.quantity) || 0) <= 0).length;

    // Category analysis
    const categoryMap = new Map<string, { count: number; value: number }>();
    items.forEach(item => {
      const category = item.category || 'Uncategorized';
      const value = item.unit_price * item.quantity;
      const existing = categoryMap.get(category) || { count: 0, value: 0 };
      categoryMap.set(category, {
        count: existing.count + 1,
        value: existing.value + value
      });
    });

    const topCategories = Array.from(categoryMap.entries())
      .map(([category, data]) => ({ category, ...data }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    // Supplier analysis
    const supplierMap = new Map<string, { count: number; value: number }>();
    items.forEach(item => {
      const supplier = item.supplier || 'Unknown';
      const value = item.unit_price * item.quantity;
      const existing = supplierMap.get(supplier) || { count: 0, value: 0 };
      supplierMap.set(supplier, {
        count: existing.count + 1,
        value: existing.value + value
      });
    });

    const topSuppliers = Array.from(supplierMap.entries())
      .map(([supplier, data]) => ({ supplier, ...data }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    // Mock trends data (in real app, this would come from historical data)
    const stockTrends = Array.from({ length: 12 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (11 - i));
      return {
        date: date.toISOString().split('T')[0],
        totalStock: Math.floor(totalItems * (0.8 + Math.random() * 0.4)),
        totalValue: Math.floor(totalValue * (0.8 + Math.random() * 0.4))
      };
    });

    // Mock monthly movement
    const monthlyMovement = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - i));
      return {
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        added: Math.floor(Math.random() * 50 + 10),
        removed: Math.floor(Math.random() * 30 + 5)
      };
    });

    // Mock turnover rate
    const turnoverRate = Math.random() * 4 + 1; // 1-5 times per year

    return {
      totalValue,
      totalItems,
      lowStockItems,
      outOfStockItems,
      averageItemValue,
      topCategories,
      topSuppliers,
      stockTrends,
      turnoverRate,
      monthlyMovement
    };
  }, [items]);

  return {
    analytics,
    isLoading,
    refetch: () => {} // Placeholder for potential refetch functionality
  };
}