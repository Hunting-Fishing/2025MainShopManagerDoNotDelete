
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
    const revenueData = Array.from(revenueByDate, ([date, value]) => ({
      date,
      revenue: value
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
      const customer = wo.customers?.[0] || {};
      
      return {
        id: wo.id,
        customer: customer.first_name && customer.last_name 
          ? `${customer.first_name} ${customer.last_name}`
          : "Unknown Customer",
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
    // Using the SQL execute method to run a group by query
    const { data, error } = await supabase
      .from('work_orders')
      .select('status')
      
    if (error) throw error;
    
    // Count the occurrences of each status
    const statusCounts = data.reduce((acc: Record<string, number>, order: any) => {
      const status = order.status || 'unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
    
    // Format data for charts
    const chartData = Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count: String(count) // Convert to string for formatting in chart
    }));
    
    return chartData;
  } catch (error) {
    console.error("Error fetching work order status counts:", error);
    return [];
  }
};

/**
 * Get service type distribution data
 */
export const getServiceTypeDistribution = async () => {
  try {
    // Using a more abstract query since we don't have a dedicated service type field yet
    const { data, error } = await supabase
      .from("work_orders")
      .select("description");
      
    if (error) throw error;
    
    // In a real app, you would categorize orders based on a service_type field
    // Here we're creating mock categories based on the descriptions
    const serviceTypes: Record<string, number> = {
      "Oil Change": 0,
      "Brake Service": 0,
      "Tire Replacement": 0,
      "Engine Repair": 0,
      "Transmission": 0,
      "Other": 0
    };
    
    // Assign orders to service types based on keywords in the description
    data.forEach((order: any) => {
      const description = order.description?.toLowerCase() || "";
      
      if (description.includes("oil") || description.includes("lube")) {
        serviceTypes["Oil Change"]++;
      } else if (description.includes("brake") || description.includes("rotor")) {
        serviceTypes["Brake Service"]++;
      } else if (description.includes("tire") || description.includes("wheel")) {
        serviceTypes["Tire Replacement"]++;
      } else if (description.includes("engine") || description.includes("motor")) {
        serviceTypes["Engine Repair"]++;
      } else if (description.includes("transmission")) {
        serviceTypes["Transmission"]++;
      } else {
        serviceTypes["Other"]++;
      }
    });
    
    // Format data for charts
    const chartData = Object.entries(serviceTypes).map(([type, count]) => ({
      type,
      count
    }));
    
    return chartData;
  } catch (error) {
    console.error("Error fetching service type distribution:", error);
    return [];
  }
};
