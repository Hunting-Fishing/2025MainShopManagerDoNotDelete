
import { supabase } from "@/lib/supabase";

export interface MonthlyRevenueData {
  date: string;
  revenue: number;
}

export interface ServiceTypeData {
  name: string;
  value: number;
}

// Get daily revenue data for the chart
export const getRevenueData = async (): Promise<MonthlyRevenueData[]> => {
  try {
    // Get the last 30 days range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    
    // Fetch completed work orders with revenue in date range
    const { data: workOrders, error } = await supabase
      .from('work_orders')
      .select('id, created_at, total_cost, status')
      .eq('status', 'completed')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at');
      
    if (error) throw error;
    
    if (!workOrders || workOrders.length === 0) return [];
    
    // Group by date and sum revenues
    const revenueByDate = workOrders.reduce((acc: Record<string, number>, order) => {
      const date = new Date(order.created_at).toISOString().split('T')[0];
      const revenue = parseFloat(order.total_cost) || 0;
      
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date] += revenue;
      return acc;
    }, {});
    
    // Convert to array format for the chart
    return Object.entries(revenueByDate).map(([date, revenue]) => ({
      date,
      revenue
    }));
  } catch (error) {
    console.error("Error fetching revenue data:", error);
    return [];
  }
};

// Get monthly revenue data
export const getMonthlyRevenue = async (): Promise<{ month: string; revenue: number }[]> => {
  try {
    // Get the last 6 months
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 6);
    
    // Fetch completed work orders with revenue in date range
    const { data: workOrders, error } = await supabase
      .from('work_orders')
      .select('created_at, total_cost')
      .eq('status', 'completed')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());
      
    if (error) throw error;
    
    if (!workOrders || workOrders.length === 0) return [];
    
    // Group by month and sum revenues
    const revenueByMonth = workOrders.reduce((acc: Record<string, number>, order) => {
      const date = new Date(order.created_at);
      const month = date.toLocaleString('default', { month: 'short' });
      const revenue = parseFloat(order.total_cost) || 0;
      
      if (!acc[month]) {
        acc[month] = 0;
      }
      acc[month] += revenue;
      return acc;
    }, {});
    
    // Get month names in correct order
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      months.push(d.toLocaleString('default', { month: 'short' }));
    }
    
    // Convert to array format for the chart
    return months.map(month => ({
      month,
      revenue: revenueByMonth[month] || 0
    }));
  } catch (error) {
    console.error("Error fetching monthly revenue data:", error);
    return [];
  }
};

// Get service type distribution data
export const getServiceTypeDistribution = async (): Promise<ServiceTypeData[]> => {
  try {
    // Let's first try using service_category_id if available
    const { data: workOrdersWithCategories, error: categoryError } = await supabase
      .from('work_orders')
      .select(`
        service_category_id,
        service_categories:service_category_id (name)
      `)
      .not('service_category_id', 'is', null);

    // If there's no data with service_category_id, try using service_type
    if (categoryError || !workOrdersWithCategories || workOrdersWithCategories.length === 0) {
      const { data: workOrdersWithType, error: typeError } = await supabase
        .from('work_orders')
        .select('service_type')
        .not('service_type', 'is', null);
        
      if (typeError || !workOrdersWithType || workOrdersWithType.length === 0) {
        // If no data with either field, return an empty array
        return [];
      }

      // Count work orders by service type
      const countByType = workOrdersWithType.reduce((acc: Record<string, number>, order) => {
        const type = order.service_type || 'Other';
        if (!acc[type]) {
          acc[type] = 0;
        }
        acc[type]++;
        return acc;
      }, {});

      // Convert to chart data format
      return Object.entries(countByType)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 6); // Top 6 service types
    } else {
      // Count work orders by service category
      const countByCategory = workOrdersWithCategories.reduce((acc: Record<string, number>, order) => {
        const categoryName = order.service_categories?.name || 'Other';
        if (!acc[categoryName]) {
          acc[categoryName] = 0;
        }
        acc[categoryName]++;
        return acc;
      }, {});
      
      // Convert to chart data format
      return Object.entries(countByCategory)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 6); // Top 6 service categories
    }
  } catch (error) {
    console.error("Error fetching service type distribution:", error);
    return [];
  }
};

// Get work orders by status
export const getWorkOrdersByStatus = async (): Promise<{ name: string; value: number }[]> => {
  try {
    // Fetch work order counts grouped by status
    const { data, error } = await supabase
      .from('work_orders')
      .select('status');
      
    if (error) throw error;
    
    if (!data || data.length === 0) return [];
    
    // Count work orders by status
    const countByStatus = data.reduce((acc: Record<string, number>, order) => {
      const status = order.status || 'Unknown';
      if (!acc[status]) {
        acc[status] = 0;
      }
      acc[status]++;
      return acc;
    }, {});
    
    // Convert to chart data format and make status names readable
    return Object.entries(countByStatus).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1).replace(/-/g, ' '),
      value: count
    }));
  } catch (error) {
    console.error("Error fetching work orders by status:", error);
    return [];
  }
};
