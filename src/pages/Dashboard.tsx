
import React from 'react';
import { usePageTitle } from '@/hooks/usePageTitle';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { RecentWorkOrders } from '@/components/dashboard/RecentWorkOrders';
import { UpcomingAppointments } from '@/components/dashboard/UpcomingAppointments';
import { TodaySchedule } from '@/components/dashboard/TodaySchedule';
import { DashboardTour } from '@/components/onboarding/DashboardTour';

export default function Dashboard() {
  usePageTitle('Dashboard');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's what's happening at your shop today.
        </p>
      </div>

      <DashboardStats />
      <DashboardTour />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentWorkOrders />
        </div>
        <div className="space-y-6">
          <UpcomingAppointments />
          <TodaySchedule />
        </div>
      </div>
    </div>
  );
}
