
import { supabase } from "@/lib/supabase";
import { subDays, format, startOfMonth, endOfMonth, parseISO } from "date-fns";

/**
 * Get dashboard statistics
 */
export const getDashboardStats = async () => {
  try {
    // Get active work orders count
    const { data: workOrders, error: workOrdersError } = await supabase
      .from("work_orders")
      .select("status", { count: "exact" })
      .eq("status", "in-progress");

    if (workOrdersError) throw workOrdersError;

    // Get team members count
    const { data: teamMembers, error: teamMembersError } = await supabase
      .from("profiles")
      .select("id", { count: "exact" });

    if (teamMembersError) throw teamMembersError;

    // Get inventory items count
    const { data: inventoryItems, error: inventoryError } = await supabase
      .from("inventory_items")
      .select("id", { count: "exact" });

    if (inventoryError) throw inventoryError;

    // For the work order completion time, we'll calculate based on completed work orders
    const { data: completedOrders, error: completedOrdersError } = await supabase
      .from("work_orders")
      .select("start_time, end_time")
      .eq("status", "completed");

    if (completedOrdersError) throw completedOrdersError;

    // Calculate average completion time in hours
    let avgCompletionTime = 0;
    if (completedOrders && completedOrders.length > 0) {
      const completionTimes = completedOrders
        .filter(order => order.start_time && order.end_time)
        .map(order => {
          const start = new Date(order.start_time).getTime();
          const end = new Date(order.end_time).getTime();
          return (end - start) / (1000 * 60 * 60); // Convert ms to hours
        });

      if (completionTimes.length > 0) {
        avgCompletionTime = completionTimes.reduce((sum, time) => sum + time, 0) / completionTimes.length;
      }
    }

    // Get low stock items
    const { data: lowStockItems, error: lowStockError } = await supabase
      .from("inventory_items")
      .select("id")
      .lt("quantity", 10);

    if (lowStockError) throw lowStockError;

    // Get customer count
    const { data: customers, error: customersError } = await supabase
      .from("customers")
      .select("id", { count: "exact" });

    if (customersError) throw customersError;

    // Generate revenue data (mock for now)
    const revenue = 45789.23;

    // Format the result
    return {
      revenue,
      activeOrders: workOrders?.length || 0,
      customers: customers?.length || 0,
      lowStockParts: lowStockItems?.length || 0,
      
      // Format additional stats with percentage changes
      activeWorkOrders: String(workOrders?.length || 0), // Convert to string for consistency
      workOrderChange: "+12%", // Example value, would be calculated in a real app
      
      teamMembers: String(teamMembers?.length || 0), // Convert to string for consistency
      teamChange: "+3%",
      
      inventoryItems: String(inventoryItems?.length || 0), // Convert to string for consistency
      inventoryChange: "-5%",
      
      avgCompletionTime: `${Math.round(avgCompletionTime)}h`,
      completionTimeChange: "-8%"
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    throw error;
  }
};

/**
 * Get revenue data for charts
 */
export const getRevenueData = async (timeRange: "day" | "week" | "month" | "year" = "month") => {
  try {
    let startDate: Date;
    const endDate = new Date();
    
    // Calculate the start date based on the selected time range
    switch (timeRange) {
      case "day":
        startDate = subDays(endDate, 1);
        break;
      case "week":
        startDate = subDays(endDate, 7);
        break;
      case "month":
        startDate = subDays(endDate, 30);
        break;
      case "year":
        startDate = subDays(endDate, 365);
        break;
      default:
        startDate = subDays(endDate, 30);
    }
    
    // Format dates for the database query
    const startDateString = format(startDate, "yyyy-MM-dd");
    
    // Query invoices from the database
    const { data: invoices, error } = await supabase
      .from("invoices")
      .select("date, total")
      .gte("date", startDateString)
      .order("date", { ascending: true });
      
    if (error) throw error;
    
    // Process the revenue data into a format for charts
    const revenueByDate = new Map();
    
    // Group revenue by date
    invoices?.forEach(invoice => {
      const date = invoice.date.split('T')[0]; // Extract YYYY-MM-DD format
      const currentTotal = revenueByDate.get(date) || 0;
      revenueByDate.set(date, currentTotal + Number(invoice.total));
    });
    
    // Convert to array and format for the chart
    const revenueData = Array.from(revenueByDate, ([date, revenue]) => ({
      date,
      revenue
    }));
    
    return revenueData;
  } catch (error) {
    console.error("Error fetching revenue data:", error);
    throw error;
  }
};

/**
 * Get recent work orders
 */
export const getRecentWorkOrders = async () => {
  try {
    // Fetch recent work orders from the database
    const { data, error } = await supabase
      .from("work_orders")
      .select(`
        id,
        customer_id,
        description,
        status,
        created_at,
        updated_at,
        technician_id,
        customers (
          first_name,
          last_name
        )
      `)
      .order("created_at", { ascending: false })
      .limit(5);
      
    if (error) throw error;

    // Process work orders to include customer names
    const workOrders = data.map(wo => {
      let customerName = "Unknown Customer";
      if (wo.customers && wo.customers.first_name && wo.customers.last_name) {
        customerName = `${wo.customers.first_name} ${wo.customers.last_name}`;
      }
      
      return {
        id: wo.id,
        customer: customerName,
        service: wo.description || "General Service",
        status: wo.status || "pending",
        date: format(parseISO(wo.created_at), "MMM d, yyyy"),
        priority: "medium" // Default value since we don't have this field yet
      };
    });

    return workOrders;
  } catch (error) {
    console.error("Error fetching recent work orders:", error);
    // Return empty array in case of error
    return [];
  }
};

/**
 * Get work order status distribution for charts
 */
export const getWorkOrderStatusCounts = async () => {
  try {
    // Get work orders from the database
    const { data, error } = await supabase
      .from('work_orders')
      .select('status');
      
    if (error) throw error;
    
    // Count the occurrences of each status
    const statusCounts = data.reduce((acc: Record<string, number>, order: any) => {
      const status = order.status || 'unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
    
    // Format data for charts - convert to the expected format { name: string, value: number }
    const chartData = Object.entries(statusCounts).map(([status, count]) => ({
      name: status,
      value: Number(count)
    }));
    
    return chartData;
  } catch (error) {
    console.error("Error fetching work order status counts:", error);
    return [];
  }
};

/**
 * Get monthly revenue data
 */
export const getMonthlyRevenue = async () => {
  try {
    // Get the date boundaries for the last 12 months
    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setMonth(startDate.getMonth() - 11); // 12 months including current
    
    // Format dates for the database query
    const startDateString = format(startDate, "yyyy-MM-dd");
    
    // Get invoice data from the database
    const { data, error } = await supabase
      .from("invoices")
      .select("date, total")
      .gte("date", startDateString)
      .order("date", { ascending: true });
      
    if (error) throw error;
    
    // Create a map for each month with initial zero values
    const monthlyRevenue: Record<string, number> = {};
    for (let i = 0; i < 12; i++) {
      const monthDate = new Date(startDate);
      monthDate.setMonth(monthDate.getMonth() + i);
      const monthKey = format(monthDate, "MMM yyyy");
      monthlyRevenue[monthKey] = 0;
    }
    
    // Aggregate revenue by month
    data?.forEach(invoice => {
      if (invoice.date) {
        const date = new Date(invoice.date);
        const monthKey = format(date, "MMM yyyy");
        if (monthlyRevenue[monthKey] !== undefined) {
          monthlyRevenue[monthKey] += Number(invoice.total) || 0;
        }
      }
    });
    
    // Format for chart
    const chartData = Object.entries(monthlyRevenue).map(([month, revenue]) => ({
      month,
      revenue
    }));
    
    return chartData;
  } catch (error) {
    console.error("Error fetching monthly revenue:", error);
    return [];
  }
};

/**
 * Get technician performance data
 */
export const getTechnicianPerformance = async () => {
  try {
    // Fetch completed work orders with technician information
    const { data, error } = await supabase
      .from("work_orders")
      .select(`
        id,
        technician_id,
        created_at,
        end_time,
        profiles(first_name, last_name)
      `)
      .eq("status", "completed");
      
    if (error) throw error;
    
    // Process technician data
    const technicianStats = new Map();
    const lastSixMonths = Array(6).fill(0).map((_, idx) => {
      const d = new Date();
      d.setMonth(d.getMonth() - idx);
      return format(d, "MMM");
    }).reverse();
    
    // Process each work order
    data?.forEach(order => {
      // Extract technician name
      const firstName = order.profiles?.first_name || 'Unknown';
      const lastName = order.profiles?.last_name || 'Tech';
      const techName = `${firstName} ${lastName}`;
      
      // Get the month of the work order
      const orderMonth = format(new Date(order.created_at), "MMM");
      
      // Only include work orders from the last 6 months
      if (lastSixMonths.includes(orderMonth)) {
        // Initialize technician data if not present
        if (!technicianStats.has(techName)) {
          const monthlyData = Object.fromEntries(
            lastSixMonths.map(month => [month, 0])
          );
          technicianStats.set(techName, monthlyData);
        }
        
        // Increment work order count for the technician in that month
        const techData = technicianStats.get(techName);
        techData[orderMonth] = (techData[orderMonth] || 0) + 1;
      }
    });
    
    // Create the response format
    const technicians = Array.from(technicianStats.keys());
    
    // Create chart data
    const chartData = lastSixMonths.map(month => {
      const monthData: Record<string, any> = { month };
      
      // Add data for each technician
      technicians.forEach(tech => {
        // Convert spaces to underscores for safe property names
        const techKey = tech.toLowerCase().replace(/\s+/g, '_');
        monthData[techKey] = technicianStats.get(tech)[month];
      });
      
      return monthData;
    });
    
    return {
      technicians,
      chartData
    };
  } catch (error) {
    console.error("Error fetching technician performance data:", error);
    return { technicians: [], chartData: [] };
  }
};

/**
 * Get equipment recommendations
 */
export const getEquipmentRecommendations = async () => {
  try {
    // Fetch equipment that needs maintenance soon
    const { data, error } = await supabase
      .from("equipment")
      .select("*")
      .lte("next_maintenance_date", new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]) // Within next 30 days
      .order("next_maintenance_date", { ascending: true })
      .limit(5);
      
    if (error) throw error;
    
    // Process and format the equipment data
    const recommendations = data?.map(item => ({
      id: item.id,
      name: item.name,
      model: item.model,
      maintenanceType: item.maintenance_frequency || 'Regular',
      maintenanceDate: item.next_maintenance_date,
      priority: determinePriority(item.next_maintenance_date)
    })) || [];
    
    return recommendations;
  } catch (error) {
    console.error("Error fetching equipment recommendations:", error);
    return [];
  }
};

/**
 * Helper to determine maintenance priority based on date
 */
function determinePriority(dateString: string): 'High' | 'Medium' | 'Low' {
  const today = new Date();
  const maintenanceDate = new Date(dateString);
  const daysUntilMaintenance = Math.floor((maintenanceDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysUntilMaintenance <= 7) return 'High';
  if (daysUntilMaintenance <= 14) return 'Medium';
  return 'Low';
}
