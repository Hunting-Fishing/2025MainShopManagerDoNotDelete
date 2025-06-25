import React from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { LiveRecentWorkOrders } from '@/components/dashboard/LiveRecentWorkOrders';
import { TodaySchedule } from '@/components/dashboard/TodaySchedule';
import { InventoryStats } from '@/components/inventory/InventoryStats';
import { SafeDashboardWrapper } from '@/components/dashboard/SafeDashboardWrapper';
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
          // Keep default stats on error
        }
      }
    };

    calculateStats();
  }, [items]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      {/* Header with improved spacing and mobile responsiveness */}
      <SafeDashboardWrapper componentName="Dashboard Header">
        <div className="mb-8">
          <DashboardHeader />
        </div>
      </SafeDashboardWrapper>

      {/* Main content with better grid layout and spacing */}
      <div className="space-y-8">
        {/* Stats Cards with enhanced mobile layout */}
        <SafeDashboardWrapper componentName="Stats Cards">
          <div className="w-full">
            <StatsCards />
          </div>
        </SafeDashboardWrapper>
        
        {/* Main content grid with improved responsive design */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8">
          {/* Left column - Recent Work Orders */}
          <div className="xl:col-span-8">
            <SafeDashboardWrapper componentName="Recent Work Orders">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-white to-slate-50/50">
                  <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Recent Work Orders
                  </h2>
                  <p className="text-sm text-slate-600 mt-1">Latest work order updates and status</p>
                </div>
                <LiveRecentWorkOrders />
              </div>
            </SafeDashboardWrapper>
          </div>

          {/* Right column - Schedule and Inventory */}
          <div className="xl:col-span-4 space-y-6">
            {/* Today's Schedule Card */}
            <SafeDashboardWrapper componentName="Today's Schedule">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-white to-emerald-50/50">
                  <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    Today's Schedule
                  </h2>
                  <p className="text-sm text-slate-600 mt-1">Upcoming appointments and tasks</p>
                </div>
                <TodaySchedule />
              </div>
            </SafeDashboardWrapper>

            {/* Inventory Overview Card */}
            <SafeDashboardWrapper componentName="Inventory Overview">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-white to-orange-50/50">
                  <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    Inventory Overview
                  </h2>
                  <p className="text-sm text-slate-600 mt-1">Stock levels and alerts</p>
                </div>
                <div className="p-6">
                  <InventoryStats
                    totalItems={inventoryStats.totalItems}
                    lowStockCount={inventoryStats.lowStockCount}
                    outOfStockCount={inventoryStats.outOfStockCount}
                    totalValue={inventoryStats.totalValue}
                  />
                </div>
              </div>
            </SafeDashboardWrapper>
          </div>
        </div>
      </div>
    </div>
  );
}
