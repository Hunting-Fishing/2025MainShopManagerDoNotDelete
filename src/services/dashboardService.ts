
import { supabase } from '@/lib/supabase';
import { 
  DashboardStats, 
  EquipmentRecommendation, 
  MonthlyRevenueData, 
  RecentWorkOrder,
  ServiceTypeData, 
  TechnicianPerformanceData 
} from '@/types/dashboard';
import { formatCurrency } from '@/utils/formatters';

// Get dashboard overview statistics
export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    // In a real implementation, these would be fetched from Supabase
    // For now, use mock data that matches the type
    const stats: DashboardStats = {
      revenue: 125350,
      activeOrders: 24,
      customers: 847,
      lowStockParts: 12,
      activeWorkOrders: "24",
      workOrderChange: "+12%",
      teamMembers: "8",
      teamChange: "+1",
      inventoryItems: "342",
      inventoryChange: "-5%",
      avgCompletionTime: "2.4 days",
      completionTimeChange: "-8%"
    };
    
    return stats;
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    throw error;
  }
}

// Get work orders by status for the pie chart
export async function getWorkOrderStatusCounts(): Promise<{ name: string; value: number; }[]> {
  try {
    // In a production environment, we'd use a real query like:
    // const { data, error } = await supabase
    //   .from('work_orders')
    //   .select('status, count(*)')
    //   .groupBy('status');
    
    // For now, return mock data
    return [
      { name: "Pending", value: 14 },
      { name: "In Progress", value: 24 },
      { name: "Completed", value: 38 },
      { name: "Cancelled", value: 8 }
    ];
  } catch (error) {
    console.error("Error fetching work order status counts:", error);
    return [];
  }
}

// Get service type distribution data
export async function getServiceTypeDistribution(): Promise<ServiceTypeData[]> {
  try {
    // In a production environment, we'd use a real query with groupBy
    
    // For now, return mock data
    return [
      { subject: "Oil Change", value: 35 },
      { subject: "Brake Service", value: 25 },
      { subject: "Tire Replacement", value: 18 },
      { subject: "A/C Service", value: 15 },
      { subject: "Engine Repair", value: 12 },
      { subject: "Other", value: 7 }
    ];
  } catch (error) {
    console.error("Error fetching service type distribution:", error);
    return [];
  }
}

// Get monthly revenue data for chart
export async function getMonthlyRevenue(): Promise<MonthlyRevenueData[]> {
  try {
    // In a production environment, we'd use a real query with time-based grouping
    
    // For now, return mock data
    return [
      { month: "Jan", revenue: 42500 },
      { month: "Feb", revenue: 38900 },
      { month: "Mar", revenue: 56700 },
      { month: "Apr", revenue: 78500 },
      { month: "May", revenue: 89200 },
      { month: "Jun", revenue: 74800 },
      { month: "Jul", revenue: 62300 },
      { month: "Aug", revenue: 58100 },
      { month: "Sep", revenue: 68400 },
      { month: "Oct", revenue: 72700 },
      { month: "Nov", revenue: 76800 },
      { month: "Dec", revenue: 91500 }
    ];
  } catch (error) {
    console.error("Error fetching monthly revenue data:", error);
    return [];
  }
}

// Get technician performance data for the bar chart
export async function getTechnicianPerformance(): Promise<TechnicianPerformanceData> {
  try {
    // In a production environment, we'd use a real query to get performance data
    
    // Return mock data in the correct format
    const technicians = ["John Smith", "Maria Garcia", "Alex Lee", "Sarah Johnson"];
    
    const chartData = [
      {
        month: "Jan",
        john_smith: 12,
        maria_garcia: 15,
        alex_lee: 8,
        sarah_johnson: 10
      },
      {
        month: "Feb",
        john_smith: 15,
        maria_garcia: 13,
        alex_lee: 10,
        sarah_johnson: 12
      },
      {
        month: "Mar",
        john_smith: 18,
        maria_garcia: 17,
        alex_lee: 12,
        sarah_johnson: 15
      },
      {
        month: "Apr",
        john_smith: 20,
        maria_garcia: 19,
        alex_lee: 14,
        sarah_johnson: 16
      }
    ];
    
    return { technicians, chartData };
  } catch (error) {
    console.error("Error fetching technician performance data:", error);
    return { technicians: [], chartData: [] };
  }
}

// Get equipment recommendations for maintenance
export async function getEquipmentRecommendations(): Promise<EquipmentRecommendation[]> {
  try {
    // In a production environment, we'd use a real query
    
    // Return mock data
    return [
      {
        id: "equip-1",
        name: "Wheel Balancer",
        model: "WB-5000",
        manufacturer: "TechTools",
        status: "Operational",
        maintenanceType: "Calibration Check",
        maintenanceDate: "2023-06-15",
        priority: "Medium"
      },
      {
        id: "equip-2",
        name: "Diagnostic Scanner",
        model: "DiagPro X",
        manufacturer: "AutoDiag",
        status: "Warning",
        maintenanceType: "Software Update",
        maintenanceDate: "2023-06-10",
        priority: "High"
      },
      {
        id: "equip-3",
        name: "Hydraulic Lift",
        model: "HL-2000",
        manufacturer: "LiftMaster",
        status: "Maintenance Due",
        maintenanceType: "Hydraulic Fluid Change",
        maintenanceDate: "2023-06-25",
        priority: "Medium"
      },
      {
        id: "equip-4",
        name: "AC Recovery Machine",
        model: "ACR-750",
        manufacturer: "CoolSystems",
        status: "Operational",
        maintenanceType: "Filter Replacement",
        maintenanceDate: "2023-07-05",
        priority: "Low"
      }
    ];
  } catch (error) {
    console.error("Error fetching equipment recommendations:", error);
    return [];
  }
}

// Get recent work orders for dashboard
export async function getRecentWorkOrders(): Promise<RecentWorkOrder[]> {
  try {
    // This would normally fetch from Supabase
    // For testing, we'll use mock data
    return [
      {
        id: "wo-1234",
        customer: "John Doe",
        service: "Oil Change & Filter",
        status: "Completed",
        date: "2023-06-01",
        priority: "Medium"
      },
      {
        id: "wo-1235",
        customer: "Jane Smith",
        service: "Brake Pad Replacement",
        status: "In-Progress",
        date: "2023-06-02",
        priority: "High"
      },
      {
        id: "wo-1236",
        customer: "Robert Johnson",
        service: "A/C Repair",
        status: "Pending",
        date: "2023-06-03",
        priority: "Medium"
      },
      {
        id: "wo-1237",
        customer: "Sarah Williams",
        service: "Transmission Fluid Change",
        status: "Completed",
        date: "2023-06-03",
        priority: "Low"
      },
      {
        id: "wo-1238",
        customer: "Michael Brown",
        service: "Tire Rotation",
        status: "Pending",
        date: "2023-06-04",
        priority: "Low"
      }
    ];
  } catch (error) {
    console.error("Error fetching recent work orders:", error);
    return [];
  }
}
