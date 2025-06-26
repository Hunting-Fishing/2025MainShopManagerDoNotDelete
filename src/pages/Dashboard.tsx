
import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { ServiceTypeDistributionChart } from '@/components/dashboard/ServiceTypeDistributionChart';
import { TechnicianPerformanceChart } from '@/components/dashboard/TechnicianPerformanceChart';
import { WorkOrderPhaseProgress } from '@/components/dashboard/WorkOrderPhaseProgress';
import { TodaySchedule } from '@/components/dashboard/TodaySchedule';
import { EquipmentRecommendations } from '@/components/dashboard/EquipmentRecommendations';
import { DashboardAlerts } from '@/components/dashboard/DashboardAlerts';

export default function Dashboard() {
  return (
    <Layout>
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
            <WorkOrderPhaseProgress />
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TodaySchedule />
          <EquipmentRecommendations />
        </div>
        
        <DashboardAlerts />
      </div>
    </Layout>
  );
}
