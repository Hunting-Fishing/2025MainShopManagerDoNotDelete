import { supabase } from '@/lib/supabase';
import { 
  DashboardStats, 
  EquipmentRecommendation, 
  ServiceTypeData,
  TechnicianPerformanceData,
  RecentWorkOrder,
  MonthlyRevenueData
} from '@/types/dashboard';
import { safeQueryTable } from '@/utils/schemaUtils';

// Fetches general dashboard statistics
export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    // In a real implementation, we'd fetch this data from Supabase
    return {
      revenue: 125850.75,
      activeOrders: 24,
      customers: 347,
      lowStockParts: 12,
      activeWorkOrders: "24",
      workOrderChange: "+12%",
      teamMembers: "15",
      teamChange: "+2",
      inventoryItems: "532",
      inventoryChange: "-3%",
      avgCompletionTime: "3.2 days",
      completionTimeChange: "-8%"
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
}

// Fetches data for the work orders by status chart
export async function getWorkOrdersByStatus(): Promise<{ name: string; value: number; }[]> {
  try {
    // In a real implementation, we'd use a query like:
    // const { data, error } = await supabase
    //   .from('work_orders')
    //   .select('status, count')
    //   .group('status')

    // For now, return mock data
    return [
      { name: "Pending", value: 14 },
      { name: "In Progress", value: 8 },
      { name: "Completed", value: 37 },
      { name: "Cancelled", value: 3 }
    ];
  } catch (error) {
    console.error('Error fetching work orders by status:', error);
    return [];
  }
}

// This is an alias for getWorkOrdersByStatus to match what the component is expecting
export const getWorkOrderStatusCounts = getWorkOrdersByStatus;

// Fetches data for the service type distribution chart
export async function getServiceTypeDistribution(): Promise<ServiceTypeData[]> {
  try {
    // In a real implementation, we would fetch this from the database
    // For now, return mock data
    return [
      { subject: "Oil Change", value: 42 },
      { subject: "Brake Service", value: 28 },
      { subject: "Tire Replacement", value: 23 },
      { subject: "Engine Repair", value: 15 },
      { subject: "Transmission", value: 11 },
      { subject: "Electrical", value: 18 }
    ];
  } catch (error) {
    console.error('Error fetching service type distribution:', error);
    return [];
  }
}

// Fetches technician performance data
export async function getTechnicianPerformance(): Promise<TechnicianPerformanceData> {
  try {
    // In a real implementation, we'd fetch real data from the database
    return {
      technicians: ["John Smith", "Maria Garcia", "Robert Lee", "Sarah Wilson"],
      chartData: [
        {
          month: "Jan",
          john_smith: 18,
          maria_garcia: 22,
          robert_lee: 14,
          sarah_wilson: 16
        },
        {
          month: "Feb",
          john_smith: 20,
          maria_garcia: 25,
          robert_lee: 16,
          sarah_wilson: 18
        },
        {
          month: "Mar",
          john_smith: 24,
          maria_garcia: 26,
          robert_lee: 19,
          sarah_wilson: 22
        },
        {
          month: "Apr",
          john_smith: 22,
          maria_garcia: 28,
          robert_lee: 17,
          sarah_wilson: 24
        },
        {
          month: "May",
          john_smith: 26,
          maria_garcia: 30,
          robert_lee: 20,
          sarah_wilson: 26
        },
        {
          month: "Jun",
          john_smith: 28,
          maria_garcia: 32,
          robert_lee: 22,
          sarah_wilson: 28
        }
      ]
    };
  } catch (error) {
    console.error('Error fetching technician performance:', error);
    throw new Error('Failed to fetch technician performance data');
  }
}

// Fetches equipment maintenance recommendations
export async function getEquipmentRecommendations(): Promise<EquipmentRecommendation[]> {
  try {
    // In a real implementation, we'd fetch this from the database
    return [
      {
        id: "equip-1",
        name: "Alignment Rack",
        model: "AR-5000",
        manufacturer: "TechAlign",
        status: "Operational",
        maintenanceType: "Calibration",
        maintenanceDate: "2023-06-15",
        priority: "Medium"
      },
      {
        id: "equip-2",
        name: "Diagnostic Scanner",
        model: "DS-Ultra",
        manufacturer: "AutoTech",
        status: "Warning",
        maintenanceType: "Software Update",
        maintenanceDate: "2023-05-28",
        priority: "High"
      },
      {
        id: "equip-3",
        name: "Tire Balancer",
        model: "TB-2000",
        manufacturer: "WheelPro",
        status: "Maintenance Due",
        maintenanceType: "Calibration Check",
        maintenanceDate: "2023-06-02",
        priority: "Low"
      }
    ];
  } catch (error) {
    console.error('Error fetching equipment recommendations:', error);
    return [];
  }
}

// Fetches recent work orders
export async function getRecentWorkOrders(): Promise<RecentWorkOrder[]> {
  try {
    // In a real implementation, we'd fetch this from the database
    return [
      {
        id: "wo-1234",
        customer: "John Doe",
        service: "Oil Change + Tire Rotation",
        status: "Completed",
        date: "2023-05-15",
        priority: "Medium"
      },
      {
        id: "wo-1235",
        customer: "Jane Smith",
        service: "Brake Pad Replacement",
        status: "In Progress",
        date: "2023-05-16",
        priority: "High"
      },
      {
        id: "wo-1236",
        customer: "Robert Johnson",
        service: "Engine Diagnostics",
        status: "Pending",
        date: "2023-05-17",
        priority: "Medium"
      },
      {
        id: "wo-1237",
        customer: "Maria Garcia",
        service: "Transmission Fluid Change",
        status: "Completed",
        date: "2023-05-15",
        priority: "Low"
      },
      {
        id: "wo-1238",
        customer: "David Wilson",
        service: "AC Repair",
        status: "In Progress",
        date: "2023-05-18",
        priority: "High"
      }
    ];
  } catch (error) {
    console.error('Error fetching recent work orders:', error);
    return [];
  }
}

// Fetches revenue data
export async function getRevenueData(): Promise<MonthlyRevenueData[]> {
  try {
    // In a real implementation, we'd fetch this from the database
    return [
      { month: "Apr 01", revenue: 5200 },
      { month: "Apr 02", revenue: 4800 },
      { month: "Apr 03", revenue: 5500 },
      { month: "Apr 04", revenue: 6000 },
      { month: "Apr 05", revenue: 5700 },
      { month: "Apr 06", revenue: 5900 },
      { month: "Apr 07", revenue: 6200 },
      { month: "Apr 08", revenue: 5800 },
      { month: "Apr 09", revenue: 5400 },
      { month: "Apr 10", revenue: 5600 },
      { month: "Apr 11", revenue: 6100 },
      { month: "Apr 12", revenue: 6300 },
      { month: "Apr 13", revenue: 6000 },
      { month: "Apr 14", revenue: 5800 },
      { month: "Apr 15", revenue: 6500 },
      { month: "Apr 16", revenue: 6200 },
      { month: "Apr 17", revenue: 5900 },
      { month: "Apr 18", revenue: 6100 },
      { month: "Apr 19", revenue: 6400 },
      { month: "Apr 20", revenue: 6300 },
      { month: "Apr 21", revenue: 6600 },
      { month: "Apr 22", revenue: 6200 },
      { month: "Apr 23", revenue: 5900 },
      { month: "Apr 24", revenue: 6100 },
      { month: "Apr 25", revenue: 6300 },
      { month: "Apr 26", revenue: 6500 },
      { month: "Apr 27", revenue: 6400 },
      { month: "Apr 28", revenue: 6200 },
      { month: "Apr 29", revenue: 6700 },
      { month: "Apr 30", revenue: 7000 }
    ];
  } catch (error) {
    console.error('Error fetching revenue data:', error);
    return [];
  }
}

// Function to get monthly revenue data (aggregated by month)
export async function getMonthlyRevenue(): Promise<MonthlyRevenueData[]> {
  try {
    // In a real implementation, we'd fetch this from the database with proper aggregation
    return [
      { month: "Jan", revenue: 45000 },
      { month: "Feb", revenue: 52000 },
      { month: "Mar", revenue: 48000 },
      { month: "Apr", revenue: 61000 },
      { month: "May", revenue: 55000 },
      { month: "Jun", revenue: 67000 },
      { month: "Jul", revenue: 72000 },
      { month: "Aug", revenue: 70000 },
      { month: "Sep", revenue: 65000 },
      { month: "Oct", revenue: 59000 },
      { month: "Nov", revenue: 67000 },
      { month: "Dec", revenue: 78000 }
    ];
  } catch (error) {
    console.error('Error fetching monthly revenue data:', error);
    return [];
  }
}
