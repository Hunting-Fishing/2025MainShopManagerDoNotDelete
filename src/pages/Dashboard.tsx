
import React from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { ServiceTypeDistributionChart } from '@/components/dashboard/ServiceTypeDistributionChart';
import { TechnicianPerformanceChart } from '@/components/dashboard/TechnicianPerformanceChart';
import { WorkOrderPhaseProgress } from '@/components/dashboard/WorkOrderPhaseProgress';
import { TodaySchedule } from '@/components/dashboard/TodaySchedule';
import { EquipmentRecommendations } from '@/components/dashboard/EquipmentRecommendations';
import { DashboardAlerts } from '@/components/dashboard/DashboardAlerts';
import { useDashboardData } from '@/hooks/useDashboardData';

export default function Dashboard() {
  const { phaseProgressData, isLoading } = useDashboardData();

  return (
    <div className="space-y-6">
      <DashboardHeader />
      
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
    </div>
  );
}
