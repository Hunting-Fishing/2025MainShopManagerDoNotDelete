
import { useState, useEffect } from "react";
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
} from "@/services/dashboard"; // Updated import
import { DashboardStats, TechnicianPerformanceData } from "@/types/dashboard";
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
  const [technicianEfficiency, setTechnicianEfficiency] = useState<any[]>([]); // Initialize as empty array with any type
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
        // Handle the TechnicianPerformanceData correctly:
        // Only set the chartData array part to technicianEfficiency
        setTechnicianEfficiency(efficiency.chartData || []);
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
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      <div className="grid gap-6">
        {/* Stats Cards */}
        <StatsCards stats={stats} isLoading={isLoading} />

        {/* Multi-phase Work Order Progress */}
        <div className="grid grid-cols-1 gap-6">
          <WorkOrderPhaseProgress data={phaseProgressData} isLoading={isLoading} />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <WorkOrdersByStatusChart />
          <ServiceTypeDistributionChart />
        </div>

        {/* Quality Control and Technician Efficiency */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="col-span-2">
            <TechnicianPerformanceChart />
          </div>
          <div>
            <QualityControlStats stats={stats} checklistData={checklistStats} isLoading={isLoading} />
          </div>
        </div>

        {/* Technician Efficiency Table */}
        <div className="grid grid-cols-1 gap-6">
          <TechnicianEfficiencyTable data={technicianEfficiency} isLoading={isLoading} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RecentWorkOrders />
          </div>
          <div>
            <EquipmentRecommendations />
          </div>
        </div>
      </div>
    </div>
  );
}
