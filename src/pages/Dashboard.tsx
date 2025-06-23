
import React from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { LiveRecentWorkOrders } from '@/components/dashboard/LiveRecentWorkOrders';
import { TodaySchedule } from '@/components/dashboard/TodaySchedule';
import { InventoryStats } from '@/components/inventory/InventoryStats';
import { useInventoryItems } from '@/hooks/inventory/useInventoryItems';
import { getInventoryStatistics } from '@/services/inventoryService';
import { useState, useEffect } from 'react';

export default function Dashboard() {
  const { items, isLoading: inventoryLoading } = useInventoryItems();
  const [inventoryStats, setInventoryStats] = useState({
    totalItems: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    totalValue: 0
  });

  useEffect(() => {
    const calculateStats = async () => {
      if (items.length > 0) {
        try {
          const stats = await getInventoryStatistics();
          setInventoryStats(stats);
        } catch (error) {
          console.error('Error calculating inventory stats:', error);
        }
      }
    };

    calculateStats();
  }, [items]);

  return (
    <div className="space-y-8">
      <DashboardHeader />
      <StatsCards />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <LiveRecentWorkOrders />
        </div>
        <div className="space-y-6">
          <TodaySchedule />
          <div>
            <h3 className="text-lg font-semibold mb-4">Inventory Overview</h3>
            <InventoryStats
              totalItems={inventoryStats.totalItems}
              lowStockCount={inventoryStats.lowStockCount}
              outOfStockCount={inventoryStats.outOfStockCount}
              totalValue={inventoryStats.totalValue}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
