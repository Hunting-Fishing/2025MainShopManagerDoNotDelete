import { useState, useEffect } from "react";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { WorkOrdersByStatusChart } from "@/components/dashboard/WorkOrdersByStatusChart";
import { RecentWorkOrders } from "@/components/dashboard/RecentWorkOrders";
import { TechnicianPerformanceChart } from "@/components/dashboard/TechnicianPerformanceChart";
import { ServiceTypeDistributionChart } from "@/components/dashboard/ServiceTypeDistributionChart";
import { EquipmentRecommendations } from "@/components/dashboard/EquipmentRecommendations";
import { getDashboardStats } from "@/services/dashboardService";
import { DashboardStats } from "@/types/dashboard";

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    revenue: 0,
    activeOrders: 0,
    customers: 0,
    lowStockParts: 0,
    activeWorkOrders: "0",
    workOrderChange: "0%",
    teamMembers: "0",
    teamChange: "0",
    inventoryItems: "0",
    inventoryChange: "0%",
    avgCompletionTime: "0 days",
    completionTimeChange: "0%"
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const statsData = await getDashboardStats();
        setStats(statsData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      <div className="grid gap-6">
        {/* Stats Cards */}
        <StatsCards stats={stats} isLoading={isLoading} />

        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <WorkOrdersByStatusChart />
          <ServiceTypeDistributionChart />
        </div>

        {/* Other Dashboard Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="col-span-2">
            <TechnicianPerformanceChart />
          </div>
          <div>
            <EquipmentRecommendations />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RecentWorkOrders />
          </div>
        </div>
      </div>
    </div>
  );
}
