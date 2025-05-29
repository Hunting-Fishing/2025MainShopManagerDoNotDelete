
import { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { WorkOrderPhaseProgress } from "@/components/dashboard/WorkOrderPhaseProgress";
import { RecentWorkOrders } from "@/components/dashboard/RecentWorkOrders";
import { TodaySchedule } from "@/components/dashboard/TodaySchedule";
import { DashboardAlerts } from "@/components/dashboard/DashboardAlerts";
import { TechnicianEfficiencyTable } from "@/components/dashboard/TechnicianEfficiencyTable";
import { QualityControlStats } from "@/components/dashboard/QualityControlStats";
import { getDashboardStats } from "@/services/dashboard/statsService";
import { DashboardStats } from "@/types/dashboard";

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const dashboardStats = await getDashboardStats();
        setStats(dashboardStats);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-6 p-6">
      <DashboardHeader />
      
      <StatsCards stats={stats} isLoading={isLoading} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <RevenueChart />
        </div>
        <div className="space-y-6">
          <TodaySchedule />
          <DashboardAlerts />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WorkOrderPhaseProgress />
        <RecentWorkOrders />
      </div>
      
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <TechnicianEfficiencyTable />
        <QualityControlStats />
      </div>
    </div>
  );
}
