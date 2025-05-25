
import { useState, useEffect } from "react";
import { DashboardSeo } from "@/components/seo/DashboardSeo";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { WorkOrdersByStatusChart } from "@/components/dashboard/WorkOrdersByStatusChart";
import { RecentWorkOrders } from "@/components/dashboard/RecentWorkOrders";
import { TechnicianPerformanceChart } from "@/components/dashboard/TechnicianPerformanceChart";
import { ServiceTypeDistributionChart } from "@/components/dashboard/ServiceTypeDistributionChart";
import { EquipmentRecommendations } from "@/components/dashboard/EquipmentRecommendations";
import { 
  getDashboardStats,
  getPhaseProgressData,
  getChecklistStats,
  getTechnicianEfficiency 
} from "@/services/dashboard";
import { DashboardStats } from "@/types/dashboard";
import { supabase } from '@/lib/supabase';
import { WorkOrderPhaseProgress } from "@/components/dashboard/WorkOrderPhaseProgress";
import { QualityControlStats } from "@/components/dashboard/QualityControlStats";
import { TechnicianEfficiencyTable } from "@/components/dashboard/TechnicianEfficiencyTable";

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
    completionTimeChange: "0%",
    customerSatisfaction: "0",
    phaseCompletionRate: "0%",
    schedulingEfficiency: "0%",
    qualityControlPassRate: "0%"
  });
  const [phaseProgressData, setPhaseProgressData] = useState([]);
  const [checklistStats, setChecklistStats] = useState([]);
  const [technicianEfficiency, setTechnicianEfficiency] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Check connection to Supabase
        const isConnected = await checkSupabaseConnection();
        console.log("Supabase connection status:", isConnected ? "Connected" : "Not connected");
        
        // Fetch dashboard statistics
        const statsData = await getDashboardStats();
        setStats(statsData);
        
        // Fetch phase progress data for multi-phase work orders
        const phaseData = await getPhaseProgressData();
        setPhaseProgressData(phaseData);
        
        // Fetch checklist completion statistics
        const checklists = await getChecklistStats();
        setChecklistStats(checklists);
        
        // Fetch technician efficiency metrics
        const efficiency = await getTechnicianEfficiency();
        setTechnicianEfficiency(efficiency);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);
  
  // Function to check Supabase connection
  const checkSupabaseConnection = async () => {
    try {
      const { data, error } = await supabase.from('customers').select('count').limit(1);
      if (error) {
        console.error("Supabase connection error:", error);
        return false;
      }
      return true;
    } catch (error) {
      console.error("Error checking Supabase connection:", error);
      return false;
    }
  };

  return (
    <>
      <DashboardSeo />
      <div className="container py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Work Order Management Dashboard</h1>
          <p className="text-muted-foreground">Monitor your shop's performance, track work orders, and manage equipment maintenance</p>
        </header>

        <div className="grid gap-6">
          {/* Key Performance Metrics */}
          <section aria-labelledby="stats-heading">
            <h2 id="stats-heading" className="sr-only">Key Performance Metrics</h2>
            <StatsCards stats={stats} isLoading={isLoading} />
          </section>

          {/* Work Order Progress Tracking */}
          <section aria-labelledby="progress-heading">
            <h2 id="progress-heading" className="text-xl font-semibold mb-4">Multi-Phase Work Order Progress</h2>
            <div className="grid grid-cols-1 gap-6">
              <WorkOrderPhaseProgress data={phaseProgressData} isLoading={isLoading} />
            </div>
          </section>

          {/* Performance Analytics */}
          <section aria-labelledby="analytics-heading">
            <h2 id="analytics-heading" className="text-xl font-semibold mb-4">Shop Performance Analytics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <WorkOrdersByStatusChart />
              <ServiceTypeDistributionChart />
            </div>
          </section>

          {/* Team Performance & Quality Control */}
          <section aria-labelledby="team-heading">
            <h2 id="team-heading" className="text-xl font-semibold mb-4">Team Performance & Quality Control</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="col-span-2">
                <TechnicianPerformanceChart />
              </div>
              <div>
                <QualityControlStats stats={stats} checklistData={checklistStats} isLoading={isLoading} />
              </div>
            </div>
          </section>

          {/* Technician Efficiency Analysis */}
          <section aria-labelledby="efficiency-heading">
            <h2 id="efficiency-heading" className="text-xl font-semibold mb-4">Technician Efficiency Analysis</h2>
            <div className="grid grid-cols-1 gap-6">
              <TechnicianEfficiencyTable data={technicianEfficiency} isLoading={isLoading} />
            </div>
          </section>

          {/* Recent Activity & Recommendations */}
          <section aria-labelledby="activity-heading">
            <h2 id="activity-heading" className="text-xl font-semibold mb-4">Recent Activity & Equipment Recommendations</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <RecentWorkOrders />
              </div>
              <div>
                <EquipmentRecommendations />
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
