
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { LiveDashboardStats } from '@/components/dashboard/LiveDashboardStats';
import { LiveRecentWorkOrders } from '@/components/dashboard/LiveRecentWorkOrders';

export default function Dashboard() {
  return (
    <>
      <Helmet>
        <title>Dashboard | ServicePro</title>
      </Helmet>
      
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to your shop management dashboard
          </p>
        </div>
        
        <LiveDashboardStats />
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <LiveRecentWorkOrders />
          </div>
        </div>
      </div>
    </>
  );
}
