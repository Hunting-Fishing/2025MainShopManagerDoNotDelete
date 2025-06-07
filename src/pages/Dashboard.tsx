
import React, { useState, useEffect } from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { TechnicianPerformanceChart } from '@/components/dashboard/TechnicianPerformanceChart';
import { RecentWorkOrders } from '@/components/dashboard/RecentWorkOrders';
import { WorkOrderPhaseProgress } from '@/components/dashboard/WorkOrderPhaseProgress';
import { getDashboardStats, getPhaseProgress } from '@/services/dashboard';
import { DashboardStats, PhaseProgressItem } from '@/types/dashboard';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Database } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [phaseProgressData, setPhaseProgressData] = useState<PhaseProgressItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [phaseProgressLoading, setPhaseProgressLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        const dashboardStats = await getDashboardStats();
        setStats(dashboardStats);
        setError(null);
      } catch (err) {
        console.error("Error fetching dashboard stats:", err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    const fetchPhaseProgress = async () => {
      try {
        setPhaseProgressLoading(true);
        const phaseData = await getPhaseProgress();
        setPhaseProgressData(phaseData);
      } catch (err) {
        console.error("Error fetching phase progress:", err);
      } finally {
        setPhaseProgressLoading(false);
      }
    };

    fetchDashboardStats();
    fetchPhaseProgress();
  }, []);

  return (
    <div className="space-y-6">
      <DashboardHeader />
      
      <Alert>
        <Database className="h-4 w-4" />
        <AlertDescription>
          All dashboard data is live from your Supabase database. No mock or sample data is displayed.
        </AlertDescription>
      </Alert>
      
      <StatsCards 
        stats={stats ? {
          activeWorkOrders: stats.activeOrders,
          workOrderChange: stats.workOrderChange,
          teamMembers: parseInt(stats.teamMembers),
          teamChange: stats.teamChange,
          inventoryItems: parseInt(stats.inventoryItems),
          inventoryChange: stats.inventoryChange,
          avgCompletionTime: stats.avgCompletionTime,
          completionTimeChange: stats.completionTimeChange,
          customerSatisfaction: parseFloat(stats.customerSatisfaction.replace('%', '')),
          schedulingEfficiency: stats.schedulingEfficiency,
        } : undefined}
        isLoading={loading}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <RevenueChart />
        <TechnicianPerformanceChart />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <RecentWorkOrders />
        <WorkOrderPhaseProgress 
          data={phaseProgressData}
          isLoading={phaseProgressLoading}
        />
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
