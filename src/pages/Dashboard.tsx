
import React, { useState } from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { ServiceTypeDistributionChart } from '@/components/dashboard/ServiceTypeDistributionChart';
import { TechnicianPerformanceChart } from '@/components/dashboard/TechnicianPerformanceChart';
import { WorkOrderPhaseProgress } from '@/components/dashboard/WorkOrderPhaseProgress';
import { TodaySchedule } from '@/components/dashboard/TodaySchedule';
import { EquipmentRecommendations } from '@/components/dashboard/EquipmentRecommendations';
import { DashboardAlerts } from '@/components/dashboard/DashboardAlerts';
import { NonprofitAnalyticsDashboard } from '@/components/analytics/NonprofitAnalyticsDashboard';
import { useDashboardData } from '@/hooks/useDashboardData';
import { Button } from '@/components/ui/button';
import { BarChart3, Heart } from 'lucide-react';
import { RefreshButton } from '@/components/reports/RefreshButton';
import { PerformanceMonitor } from '@/components/dashboard/PerformanceMonitor';

export default function Dashboard() {
  const { phaseProgressData, isLoading, lastUpdated, refreshData } = useDashboardData();
  const [activeView, setActiveView] = useState<'default' | 'nonprofit'>('default');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <DashboardHeader />
        <div className="flex gap-2 items-center">
          <RefreshButton 
            onClick={refreshData}
            lastUpdated={lastUpdated}
            isLoading={isLoading}
          />
          <Button
            variant={activeView === 'default' ? 'default' : 'outline'}
            onClick={() => setActiveView('default')}
            className="flex items-center gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            Standard Dashboard
          </Button>
          <Button
            variant={activeView === 'nonprofit' ? 'default' : 'outline'}
            onClick={() => setActiveView('nonprofit')}
            className="flex items-center gap-2"
          >
            <Heart className="h-4 w-4" />
            Nonprofit Analytics
          </Button>
        </div>
      </div>

      {activeView === 'default' ? (
        <>
          <StatsCards />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RevenueChart />
            <ServiceTypeDistributionChart />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <TechnicianPerformanceChart />
            </div>
            <div>
              <WorkOrderPhaseProgress data={phaseProgressData} isLoading={isLoading} />
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TodaySchedule />
            <EquipmentRecommendations />
          </div>
          
          <DashboardAlerts />
        </>
      ) : (
        <NonprofitAnalyticsDashboard />
      )}
      
      <PerformanceMonitor />
    </div>
  );
}
