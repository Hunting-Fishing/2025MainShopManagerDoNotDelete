
import { DashboardStats, EquipmentRecommendation, MonthlyRevenueData, RecentWorkOrder, ServiceTypeData, TechnicianPerformanceData } from "@/types/dashboard";
import { supabase } from "@/lib/supabase";

export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    // Get active work orders count
    const { count: activeOrdersCount, error: workOrderError } = await supabase
      .from('work_orders')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'active');
      
    // Get customer count
    const { count: customersCount, error: customersError } = await supabase
      .from('customers')
      .select('id', { count: 'exact', head: true });
      
    // Get team members count
    const { count: teamCount, error: teamError } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true });
      
    // Get inventory count
    const { count: inventoryCount, error: inventoryError } = await supabase
      .from('inventory_items')
      .select('id', { count: 'exact', head: true });
      
    // Get revenue data
    const { data: invoiceData, error: invoiceError } = await supabase
      .from('invoices')
      .select('total')
      .gte('created_at', new Date(new Date().setDate(1)).toISOString()) // Current month
      .lt('created_at', new Date(new Date().setMonth(new Date().getMonth() + 1, 1)).toISOString());
    
    // Calculate total revenue
    const totalRevenue = invoiceData?.reduce((sum, invoice) => sum + (Number(invoice.total) || 0), 0) || 0;
    
    // Low stock parts
    const { count: lowStockCount, error: lowStockError } = await supabase
      .from('inventory_items')
      .select('id', { count: 'exact', head: true })
      .lt('quantity', 5);
      
    // Get work order change percentage (compare to previous month)
    const previousMonthStart = new Date();
    previousMonthStart.setMonth(previousMonthStart.getMonth() - 1);
    previousMonthStart.setDate(1);
    
    const previousMonthEnd = new Date();
    previousMonthEnd.setDate(0);
    
    const { count: previousMonthOrders, error: prevOrderError } = await supabase
      .from('work_orders')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', previousMonthStart.toISOString())
      .lt('created_at', previousMonthEnd.toISOString());
    
    // Calculate percentages
    let workOrderChange = '0%';
    if (previousMonthOrders && activeOrdersCount) {
      const changePercent = ((activeOrdersCount - previousMonthOrders) / previousMonthOrders) * 100;
      workOrderChange = (changePercent > 0 ? '+' : '') + changePercent.toFixed(1) + '%';
    }
    
    // Handle any errors
    if (workOrderError || customersError || teamError || inventoryError || invoiceError || lowStockError || prevOrderError) {
      console.error("Error fetching dashboard stats:", {
        workOrderError, customersError, teamError, inventoryError, invoiceError, lowStockError, prevOrderError
      });
    }
    
    return {
      activeOrders: activeOrdersCount || 0,
      customers: customersCount || 0,
      lowStockParts: lowStockCount || 0,
      revenue: totalRevenue,
      activeWorkOrders: activeOrdersCount?.toString() || "0",
      workOrderChange: workOrderChange,
      teamMembers: teamCount?.toString() || "0",
      teamChange: "+0%",
      inventoryItems: inventoryCount?.toString() || "0",
      inventoryChange: "0%",
      avgCompletionTime: "2.5 days",
      completionTimeChange: "-5%"
    };
  } catch (error) {
    console.error("Error in getDashboardStats:", error);
    return {
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
    };
  }
}

export async function getWorkOrdersByStatus(): Promise<{ name: string; value: number }[]> {
  try {
    const { data, error } = await supabase
      .from('work_orders')
      .select('status')
      
    if (error) throw error;
    
    if (!data || data.length === 0) {
      return [
        { name: "Pending", value: 0 },
        { name: "In Progress", value: 0 },
        { name: "Completed", value: 0 },
        { name: "Cancelled", value: 0 }
      ];
    }
    
    // Count work orders by status
    const statusCounts: Record<string, number> = {};
    data.forEach(workOrder => {
      const status = workOrder.status || 'Unknown';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    
    // Convert to the required format
    return Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
    
  } catch (error) {
    console.error("Error fetching work orders by status:", error);
    return [
      { name: "Pending", value: 0 },
      { name: "In Progress", value: 0 },
      { name: "Completed", value: 0 },
      { name: "Cancelled", value: 0 }
    ];
  }
}

export async function getTechnicianPerformance(): Promise<TechnicianPerformanceData> {
  try {
    // Get list of technicians
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name')
      .order('last_name', { ascending: true });
      
    if (profilesError) throw profilesError;
    
    // Get work orders completed by each technician
    const { data: workOrdersData, error: workOrdersError } = await supabase
      .from('work_orders')
      .select('technician_id, created_at, status');
      
    if (workOrdersError) throw workOrdersError;
    
    // Get technician names and generate performance data
    const technicians = profilesData?.map(profile => `${profile.first_name} ${profile.last_name}`) || [];
    const techIds = profilesData?.map(profile => profile.id) || [];
    
    // Group work orders by month and technician
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    const recentMonths = months.slice(Math.max(0, currentMonth - 5), currentMonth + 1);
    
    // Initialize chart data
    const chartData = recentMonths.map(month => {
      const data: Record<string, any> = { month };
      technicians.forEach((tech, index) => {
        // Generate tech key (use lowercase and underscores)
        const techKey = tech.toLowerCase().replace(/\s+/g, '_');
        data[techKey] = 0;
      });
      return data;
    });
    
    // Fill in actual data (simplified for now)
    if (workOrdersData && workOrdersData.length > 0) {
      workOrdersData.forEach(wo => {
        if (wo.status === 'completed' && wo.technician_id) {
          const orderMonth = new Date(wo.created_at).getMonth();
          const techIndex = techIds.findIndex(id => id === wo.technician_id);
          
          if (techIndex >= 0) {
            const monthIndex = recentMonths.findIndex(m => months.indexOf(m) === orderMonth);
            if (monthIndex >= 0) {
              const techName = technicians[techIndex];
              const techKey = techName.toLowerCase().replace(/\s+/g, '_');
              chartData[monthIndex][techKey] = (chartData[monthIndex][techKey] || 0) + 1;
            }
          }
        }
      });
    }
    
    return {
      technicians,
      chartData
    };
  } catch (error) {
    console.error("Error fetching technician performance:", error);
    return {
      technicians: ['Technician 1', 'Technician 2'],
      chartData: [
        { month: 'Jan', technician_1: 0, technician_2: 0 }
      ]
    };
  }
}

export async function getServiceTypeDistribution(): Promise<ServiceTypeData[]> {
  try {
    // Get work orders with service types
    const { data, error } = await supabase
      .from('work_orders')
      .select('description');
      
    if (error) throw error;
    
    if (!data || data.length === 0) {
      return [
        { name: "Maintenance", value: 0 },
        { name: "Repair", value: 0 },
        { name: "Inspection", value: 0 },
        { name: "Other", value: 0 }
      ];
    }
    
    // For now, we'll use a simple keyword-based approach to categorize service types
    const serviceCounts: Record<string, number> = {
      "Maintenance": 0,
      "Repair": 0,
      "Inspection": 0,
      "Other": 0
    };
    
    data.forEach(wo => {
      const desc = (wo.description || "").toLowerCase();
      
      if (desc.includes('maintenance') || desc.includes('service') || desc.includes('oil change')) {
        serviceCounts["Maintenance"]++;
      } else if (desc.includes('repair') || desc.includes('fix') || desc.includes('replace')) {
        serviceCounts["Repair"]++;
      } else if (desc.includes('inspect') || desc.includes('check') || desc.includes('diagnostic')) {
        serviceCounts["Inspection"]++;
      } else {
        serviceCounts["Other"]++;
      }
    });
    
    // Convert to the required format
    return Object.entries(serviceCounts).map(([name, value]) => ({ name, value }));
  } catch (error) {
    console.error("Error fetching service type distribution:", error);
    return [
      { name: "Maintenance", value: 0 },
      { name: "Repair", value: 0 },
      { name: "Inspection", value: 0 },
      { name: "Other", value: 0 }
    ];
  }
}

export async function getRecentWorkOrders(): Promise<RecentWorkOrder[]> {
  try {
    // Get recent work orders with customer info
    const { data, error } = await supabase
      .from('work_orders')
      .select(`
        id,
        customer_id,
        description,
        status,
        created_at,
        priority,
        customers(first_name, last_name)
      `)
      .order('created_at', { ascending: false })
      .limit(5);
      
    if (error) throw error;
    
    if (!data || data.length === 0) {
      return [];
    }
    
    // Format the data
    return data.map(wo => ({
      id: wo.id,
      customer: wo.customers ? `${wo.customers.first_name} ${wo.customers.last_name}` : 'Unknown Customer',
      service: wo.description || 'No description',
      status: wo.status || 'Unknown',
      priority: wo.priority || 'Medium',
      date: new Date(wo.created_at).toLocaleDateString()
    }));
  } catch (error) {
    console.error("Error fetching recent work orders:", error);
    return [];
  }
}

export async function getEquipmentRecommendations(): Promise<EquipmentRecommendation[]> {
  try {
    // Get equipment with upcoming maintenance
    const { data, error } = await supabase
      .from('equipment')
      .select('*')
      .order('next_maintenance_date', { ascending: true })
      .limit(5);
      
    if (error) throw error;
    
    if (!data || data.length === 0) {
      return [];
    }
    
    // Format the data
    return data.map(equip => ({
      id: equip.id,
      name: equip.name || 'Unknown Equipment',
      model: equip.model || 'N/A',
      manufacturer: equip.manufacturer || 'N/A',
      status: equip.status || 'Active',
      priority: determinePriority(equip.next_maintenance_date),
      maintenanceDate: formatDate(equip.next_maintenance_date),
      maintenanceType: equip.maintenance_frequency || 'Regular'
    }));
  } catch (error) {
    console.error("Error fetching equipment recommendations:", error);
    return [];
  }
}

export async function getRevenueData(): Promise<MonthlyRevenueData[]> {
  try {
    // Get invoice data for the past 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { data, error } = await supabase
      .from('invoices')
      .select('date, total')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('date', { ascending: true });
      
    if (error) throw error;
    
    if (!data || data.length === 0) {
      // Return empty data for the past 30 days
      const result: MonthlyRevenueData[] = [];
      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        result.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          revenue: 0
        });
      }
      return result;
    }
    
    // Group by date and sum up revenue
    const revenueByDate: Record<string, number> = {};
    data.forEach(invoice => {
      const dateStr = new Date(invoice.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      revenueByDate[dateStr] = (revenueByDate[dateStr] || 0) + Number(invoice.total || 0);
    });
    
    // Convert to the required format
    return Object.entries(revenueByDate).map(([date, revenue]) => ({
      date,
      revenue
    }));
  } catch (error) {
    console.error("Error fetching revenue data:", error);
    return [];
  }
}

export async function getMonthlyRevenue(): Promise<{ month: string, revenue: number }[]> {
  try {
    // Get revenue by month for the past 12 months
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
    twelveMonthsAgo.setDate(1);
    
    const { data, error } = await supabase
      .from('invoices')
      .select('date, total')
      .gte('created_at', twelveMonthsAgo.toISOString());
      
    if (error) throw error;
    
    if (!data || data.length === 0) {
      // Return empty data for the past 12 months
      const result: { month: string, revenue: number }[] = [];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      for (let i = 0; i < 12; i++) {
        const monthIndex = (twelveMonthsAgo.getMonth() + i) % 12;
        result.push({
          month: months[monthIndex],
          revenue: 0
        });
      }
      return result;
    }
    
    // Group by month and sum up revenue
    const revenueByMonth: Record<string, number> = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    data.forEach(invoice => {
      const date = new Date(invoice.date);
      const monthName = months[date.getMonth()];
      revenueByMonth[monthName] = (revenueByMonth[monthName] || 0) + Number(invoice.total || 0);
    });
    
    // Convert to the required format and ensure all months are included
    const result: { month: string, revenue: number }[] = [];
    for (let i = 0; i < 12; i++) {
      const monthIndex = (twelveMonthsAgo.getMonth() + i) % 12;
      const monthName = months[monthIndex];
      result.push({
        month: monthName,
        revenue: revenueByMonth[monthName] || 0
      });
    }
    
    return result;
  } catch (error) {
    console.error("Error fetching monthly revenue:", error);
    return [];
  }
}

// Helper functions
function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'Not scheduled';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch (e) {
    return 'Invalid date';
  }
}

function determinePriority(dateStr: string | null): string {
  if (!dateStr) return 'Low';
  
  try {
    const maintenanceDate = new Date(dateStr);
    const today = new Date();
    const daysDifference = Math.floor((maintenanceDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDifference < 0) return 'High'; // Overdue
    if (daysDifference < 7) return 'High';
    if (daysDifference < 30) return 'Medium';
    return 'Low';
  } catch (e) {
    return 'Medium';
  }
}
