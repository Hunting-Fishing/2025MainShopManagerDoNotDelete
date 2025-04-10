import { supabase } from '@/lib/supabase';
import { DashboardStats, EquipmentRecommendation, ServiceTypeData, TechnicianPerformance, MonthlyRevenueData } from '@/types/dashboard';
import { safeQueryTable } from '@/utils/schemaUtils';

export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    // Mock data for demonstration purposes
    const stats: DashboardStats = {
      revenue: 52345,
      activeOrders: 78,
      customers: 234,
      lowStockParts: 12,
      activeWorkOrders: "+12%",
      workOrderChange: "+3",
      teamMembers: "+5%",
      teamChange: "+1",
      inventoryItems: "-3%",
      inventoryChange: "-2",
      avgCompletionTime: "-10%",
      completionTimeChange: "-5"
    };
    return stats;
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    // Return default values in case of an error
    return {
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
    };
  }
}

export async function getRevenueData(): Promise<any[]> {
  try {
    // Mock data for demonstration purposes
    const revenueData = [
      { date: "2024-01-01", revenue: 1500 },
      { date: "2024-01-02", revenue: 1800 },
      { date: "2024-01-03", revenue: 2000 },
      { date: "2024-01-04", revenue: 2200 },
      { date: "2024-01-05", revenue: 2500 },
      { date: "2024-01-06", revenue: 2300 },
      { date: "2024-01-07", revenue: 2600 },
      { date: "2024-01-08", revenue: 2800 },
      { date: "2024-01-09", revenue: 3000 },
      { date: "2024-01-10", revenue: 3200 },
      { date: "2024-01-11", revenue: 3500 },
      { date: "2024-01-12", revenue: 3300 },
      { date: "2024-01-13", revenue: 3600 },
      { date: "2024-01-14", revenue: 3800 },
      { date: "2024-01-15", revenue: 4000 },
      { date: "2024-01-16", revenue: 4200 },
      { date: "2024-01-17", revenue: 4500 },
      { date: "2024-01-18", revenue: 4300 },
      { date: "2024-01-19", revenue: 4600 },
      { date: "2024-01-20", revenue: 4800 },
      { date: "2024-01-21", revenue: 5000 },
      { date: "2024-01-22", revenue: 5200 },
      { date: "2024-01-23", revenue: 5500 },
      { date: "2024-01-24", revenue: 5300 },
      { date: "2024-01-25", revenue: 5600 },
      { date: "2024-01-26", revenue: 5800 },
      { date: "2024-01-27", revenue: 6000 },
      { date: "2024-01-28", revenue: 6200 },
      { date: "2024-01-29", revenue: 6500 },
      { date: "2024-01-30", revenue: 6300 }
    ];
    return revenueData;
  } catch (error) {
    console.error("Error fetching revenue data:", error);
    return [];
  }
}

export async function getWorkOrderStatusCounts() {
  try {
    const { data, error } = await safeQueryTable('work_orders')
      .select('status, count(*)')
      .group('status');
      
    if (error) {
      console.error('Error fetching work order status counts:', error);
      return [];
    }
    
    // Fix the mapping to convert to the correct format
    const formattedData = data.map(item => ({
      name: item.status,
      value: parseInt(item.count)
    }));
    
    return formattedData;
  } catch (error) {
    console.error('Error fetching work order status counts:', error);
    return [];
  }
}

export async function getTechnicianStats() {
  try {
    const { data: workOrders, error: workOrdersError } = await safeQueryTable('work_orders')
      .select('technician_id, count(*)')
      .group('technician_id');
      
    if (workOrdersError) {
      console.error('Error fetching work orders:', workOrdersError);
      return null;
    }
    
    const { data: profiles, error: profilesError } = await safeQueryTable('profiles')
      .select('first_name, last_name');
      
    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      return null;
    }

    // Make sure we're accessing individual profiles correctly
    if (profiles && Array.isArray(profiles) && profiles.length > 0) {
      const profileData = profiles;
      const technicianName = profileData?.[0]?.first_name && profileData?.[0]?.last_name ? 
        `${profileData[0].first_name} ${profileData[0].last_name}` : "Unknown";
      
      return {
        technicianName: technicianName,
        completedOrders: workOrders.length
      };
    }
    
    return {
      technicianName: "Unknown",
      completedOrders: 0
    };
  } catch (error) {
    console.error('Error fetching technician stats:', error);
    return null;
  }
}

export async function getEquipmentRecommendations(): Promise<EquipmentRecommendation[]> {
  try {
    // In a real implementation, we would fetch from the database
    // For now, return mock data that matches our type
    return [
      {
        id: "eq-1",
        name: "Alignment Machine",
        model: "XTS-4000",
        manufacturer: "TechAlign",
        status: "Due",
        maintenanceType: "Calibration",
        maintenanceDate: "2025-05-15",
        priority: "High"
      },
      {
        id: "eq-2",
        name: "Tire Balancer",
        model: "TB-360",
        manufacturer: "WheelPro",
        status: "Upcoming",
        maintenanceType: "Preventative",
        maintenanceDate: "2025-05-25",
        priority: "Medium"
      },
      {
        id: "eq-3",
        name: "Diagnostic Scanner",
        model: "DS-9000",
        manufacturer: "AutoDiag",
        status: "Upcoming",
        maintenanceType: "Software Update",
        maintenanceDate: "2025-06-05",
        priority: "Low"
      }
    ];
  } catch (error) {
    console.error("Error fetching equipment recommendations:", error);
    return [];
  }
}

export async function getServiceTypeDistribution(): Promise<ServiceTypeData[]> {
  try {
    // In a real implementation, we would fetch from the database
    // For now, return mock data
    return [
      { subject: "Oil Change", value: 35 },
      { subject: "Brake Service", value: 25 },
      { subject: "Tire Service", value: 20 },
      { subject: "Engine Repair", value: 12 },
      { subject: "Electrical", value: 8 }
    ];
  } catch (error) {
    console.error("Error fetching service type distribution:", error);
    return [];
  }
}

export async function getTechnicianPerformance(): Promise<TechnicianPerformance[]> {
  try {
    // In a real implementation, we would fetch from the database
    // For now, return mock data
    return [
      { name: "John Smith", completedOrders: 42, averageTime: 75, customerRating: 4.8 },
      { name: "Sarah Johnson", completedOrders: 36, averageTime: 65, customerRating: 4.9 },
      { name: "Mike Davis", completedOrders: 39, averageTime: 70, customerRating: 4.7 },
      { name: "Emma Wilson", completedOrders: 28, averageTime: 85, customerRating: 4.6 }
    ];
  } catch (error) {
    console.error("Error fetching technician performance data:", error);
    return [];
  }
}

export async function getMonthlyRevenue(): Promise<MonthlyRevenueData[]> {
  try {
    // In a real implementation, we would fetch from the database
    // For now, return mock data
    return [
      { month: "Jan", revenue: 42000 },
      { month: "Feb", revenue: 38000 },
      { month: "Mar", revenue: 45000 },
      { month: "Apr", revenue: 48000 },
      { month: "May", revenue: 52000 },
      { month: "Jun", revenue: 58000 }
    ];
  } catch (error) {
    console.error("Error fetching monthly revenue data:", error);
    return [];
  }
}
