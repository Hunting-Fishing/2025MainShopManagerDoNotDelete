
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
import { getPhaseProgress } from "@/services/dashboard/workOrderService";
import { getTechnicianEfficiency } from "@/services/dashboard/technicianService";
import { getChecklistStats } from "@/services/dashboard/checklistService";
import { DashboardStats, PhaseProgressItem, TechnicianEfficiencyData, ChecklistStat } from "@/types/dashboard";

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [phaseProgress, setPhaseProgress] = useState<PhaseProgressItem[]>([]);
  const [technicianData, setTechnicianData] = useState<TechnicianEfficiencyData[]>([]);
  const [checklistData, setChecklistData] = useState<ChecklistStat[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const [dashboardStats, phaseData, techData, checkData] = await Promise.all([
          getDashboardStats(),
          getPhaseProgress(),
          getTechnicianEfficiency(),
          getChecklistStats()
        ]);
        
        setStats(dashboardStats);
        setPhaseProgress(phaseData);
        setTechnicianData(techData);
        setChecklistData(checkData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Transform stats for StatsCards component
  const transformedStats = stats ? {
    activeWorkOrders: parseInt(stats.activeWorkOrders) || 0,
    workOrderChange: stats.workOrderChange,
    teamMembers: parseInt(stats.teamMembers) || 0,
    teamChange: stats.teamChange,
    inventoryItems: parseInt(stats.inventoryItems) || 0,
    inventoryChange: stats.inventoryChange,
    avgCompletionTime: stats.avgCompletionTime,
    completionTimeChange: stats.completionTimeChange,
    customerSatisfaction: parseFloat(stats.customerSatisfaction) || 0,
    schedulingEfficiency: stats.schedulingEfficiency
  } : undefined;

  return (
    <div className="space-y-6 p-6">
      <DashboardHeader />
      
      <StatsCards stats={transformedStats} isLoading={isLoading} />
      
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
        <WorkOrderPhaseProgress data={phaseProgress} isLoading={isLoading} />
        <RecentWorkOrders />
      </div>
      
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <TechnicianEfficiencyTable data={technicianData} isLoading={isLoading} />
        <QualityControlStats stats={stats} checklistData={checklistData} isLoading={isLoading} />
      </div>
    </div>
  );
}
