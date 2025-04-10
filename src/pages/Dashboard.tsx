
import { StatsCards } from "@/components/dashboard/StatsCards";
import { RecentWorkOrders } from "@/components/dashboard/RecentWorkOrders";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { WorkOrdersByStatusChart } from "@/components/dashboard/WorkOrdersByStatusChart";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { MonthlyRevenueChart } from "@/components/dashboard/MonthlyRevenueChart";
import { TechnicianPerformanceChart } from "@/components/dashboard/TechnicianPerformanceChart";
import { EquipmentRecommendations } from "@/components/dashboard/EquipmentRecommendations";
import { useEffect, useState } from "react";
import { getDashboardStats } from "@/services/dashboardService";

export default function Dashboard() {
  const [stats, setStats] = useState({
    revenue: 0,
    activeOrders: 0,
    customers: 0,
    lowStockParts: 0,
    activeWorkOrders: "",
    workOrderChange: "",
    teamMembers: "",
    teamChange: "",
    inventoryItems: "",
    inventoryChange: "",
    avgCompletionTime: "",
    completionTimeChange: ""
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardStats = async () => {
      try {
        setIsLoading(true);
        const dashboardStats = await getDashboardStats();
        setStats(dashboardStats);
      } catch (error) {
        console.error("Error loading dashboard stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardStats();
  }, []);

  return (
    <div className="space-y-6">
      <DashboardHeader />
      
      <StatsCards stats={stats} isLoading={isLoading} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <RevenueChart />
        <WorkOrdersByStatusChart />
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <MonthlyRevenueChart />
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <TechnicianPerformanceChart />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <EquipmentRecommendations />
        </div>
        <div className="md:col-span-2">
          <RecentWorkOrders />
        </div>
      </div>
    </div>
  );
}
