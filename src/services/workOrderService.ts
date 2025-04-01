
import { supabase } from "@/integrations/supabase/client";

export const getWorkOrderStatusCounts = async () => {
  try {
    const { data, error } = await supabase
      .from('work_orders')
      .select('status, count(*)')
      .group('status');

    if (error) {
      console.error("Error fetching work order status counts:", error);
      throw error;
    }

    // Transform the data into the expected format
    const counts = {
      pending: 0,
      inProgress: 0,
      completed: 0,
      cancelled: 0
    };

    data.forEach(item => {
      if (item.status === 'pending') counts.pending = parseInt(item.count);
      else if (item.status === 'in-progress') counts.inProgress = parseInt(item.count);
      else if (item.status === 'completed') counts.completed = parseInt(item.count);
      else if (item.status === 'cancelled') counts.cancelled = parseInt(item.count);
    });

    return counts;
  } catch (error) {
    console.error("Error fetching work order status counts:", error);
    throw error;
  }
};

export const getRecentWorkOrders = async (limit = 5) => {
  try {
    const { data, error } = await supabase
      .from('work_orders')
      .select(`
        id,
        description,
        status,
        created_at,
        customers(first_name, last_name),
        profiles(first_name, last_name)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching recent work orders:", error);
      throw error;
    }

    // Transform data into the expected format
    return data.map(order => {
      const customerName = order.customers ? 
        `${order.customers.first_name} ${order.customers.last_name}` : 
        'Unknown Customer';
      
      const technicianName = order.profiles ? 
        `${order.profiles.first_name} ${order.profiles.last_name}` : 
        'Unassigned';

      return {
        id: order.id,
        customer: customerName,
        service: order.description || 'No description',
        status: order.status,
        date: new Date(order.created_at).toISOString().split('T')[0],
        priority: getPriorityFromOrder(order)
      };
    });
  } catch (error) {
    console.error("Error fetching recent work orders:", error);
    throw error;
  }
};

// Helper function to determine priority (in a real app, this would be based on actual data)
const getPriorityFromOrder = (order) => {
  // This is a placeholder logic - in a real application, you'd have actual priority data
  if (order.status === 'in-progress') return 'High';
  if (order.status === 'pending') return 'Medium';
  return 'Low';
};

// Get monthly revenue data from invoices
export const getMonthlyRevenue = async () => {
  try {
    // Get current year
    const currentYear = new Date().getFullYear();
    
    const { data, error } = await supabase
      .from('invoices')
      .select('date, total')
      .gte('date', `${currentYear}-01-01`) // Filter for current year
      .lte('date', `${currentYear}-12-31`);

    if (error) {
      console.error("Error fetching monthly revenue:", error);
      throw error;
    }

    // Initialize monthly data
    const monthlyData = Array(12).fill(0).map((_, i) => ({
      month: new Date(currentYear, i, 1).toLocaleString('default', { month: 'short' }),
      revenue: 0
    }));

    // Aggregate revenue by month
    data.forEach(invoice => {
      if (invoice.date && invoice.total) {
        const date = new Date(invoice.date);
        const month = date.getMonth();
        monthlyData[month].revenue += parseFloat(invoice.total);
      }
    });

    return monthlyData;
  } catch (error) {
    console.error("Error fetching monthly revenue:", error);
    throw error;
  }
};

// Get technician performance data
export const getTechnicianPerformance = async () => {
  try {
    // Get current year
    const currentYear = new Date().getFullYear();
    
    const { data, error } = await supabase
      .from('work_orders')
      .select(`
        created_at,
        status,
        profiles(first_name, last_name)
      `)
      .eq('status', 'completed')
      .gte('created_at', `${currentYear}-01-01`)
      .lte('created_at', `${currentYear}-12-31`);

    if (error) {
      console.error("Error fetching technician performance:", error);
      throw error;
    }

    // Group completed work orders by technician and month
    const techniciansByMonth = {};
    const months = Array(12).fill(0).map((_, i) => 
      new Date(currentYear, i, 1).toLocaleString('default', { month: 'short' })
    );

    // Initialize the data structure
    data.forEach(order => {
      if (order.profiles) {
        const techName = `${order.profiles.first_name} ${order.profiles.last_name}`;
        if (!techniciansByMonth[techName]) {
          techniciansByMonth[techName] = {};
          months.forEach(month => {
            techniciansByMonth[techName][month] = 0;
          });
        }
      }
    });

    // Count completed work orders
    data.forEach(order => {
      if (order.profiles && order.created_at) {
        const techName = `${order.profiles.first_name} ${order.profiles.last_name}`;
        const date = new Date(order.created_at);
        const month = date.toLocaleString('default', { month: 'short' });
        techniciansByMonth[techName][month]++;
      }
    });

    // Format data for chart
    const chartData = months.map(month => {
      const monthData = { month };
      Object.keys(techniciansByMonth).forEach(tech => {
        // Convert technician name to safe property name
        const techKey = tech.toLowerCase().replace(/\s+/g, '_');
        monthData[techKey] = techniciansByMonth[tech][month];
      });
      return monthData;
    });

    return {
      chartData,
      technicians: Object.keys(techniciansByMonth)
    };
  } catch (error) {
    console.error("Error fetching technician performance:", error);
    throw error;
  }
};

// Get service type distribution
export const getServiceTypeDistribution = async () => {
  try {
    const { data, error } = await supabase
      .from('work_orders')
      .select('description');

    if (error) {
      console.error("Error fetching service type distribution:", error);
      throw error;
    }

    // In a real app, you'd have a more structured way to categorize services
    // This is a simplified approach to extract service types from descriptions
    const serviceTypes = {
      'HVAC': 0,
      'Electrical': 0,
      'Plumbing': 0,
      'Security': 0,
      'Fire Safety': 0,
      'Other': 0
    };

    // Simple keyword matching to categorize services
    data.forEach(order => {
      const desc = (order.description || '').toLowerCase();
      if (desc.includes('hvac') || desc.includes('heating') || desc.includes('cooling')) {
        serviceTypes['HVAC']++;
      } else if (desc.includes('electr')) {
        serviceTypes['Electrical']++;
      } else if (desc.includes('plumb') || desc.includes('water') || desc.includes('pipe')) {
        serviceTypes['Plumbing']++;
      } else if (desc.includes('secur') || desc.includes('alarm') || desc.includes('camera')) {
        serviceTypes['Security']++;
      } else if (desc.includes('fire') || desc.includes('safety')) {
        serviceTypes['Fire Safety']++;
      } else {
        serviceTypes['Other']++;
      }
    });

    // Format data for chart
    return Object.keys(serviceTypes).map(subject => ({
      subject,
      value: serviceTypes[subject]
    }));
  } catch (error) {
    console.error("Error fetching service type distribution:", error);
    throw error;
  }
};

// Get dashboard stats
export const getDashboardStats = async () => {
  try {
    // Get work order stats
    const workOrdersPromise = supabase
      .from('work_orders')
      .select('id, status, created_at', { count: 'exact' });
    
    // Get team member count
    const teamMembersPromise = supabase
      .from('profiles')
      .select('id', { count: 'exact' });
    
    // Get inventory stats
    const inventoryPromise = supabase
      .from('inventory_items')
      .select('id', { count: 'exact' });
    
    // Get average completion time (days between creation and completion)
    const avgCompletionPromise = supabase
      .from('work_orders')
      .select('created_at, updated_at')
      .eq('status', 'completed');
    
    const [
      workOrdersResult,
      teamMembersResult,
      inventoryResult,
      avgCompletionResult
    ] = await Promise.all([
      workOrdersPromise,
      teamMembersPromise,
      inventoryPromise,
      avgCompletionPromise
    ]);

    // Handle errors
    if (workOrdersResult.error) throw workOrdersResult.error;
    if (teamMembersResult.error) throw teamMembersResult.error;
    if (inventoryResult.error) throw inventoryResult.error;
    if (avgCompletionResult.error) throw avgCompletionResult.error;

    // Count active work orders (pending + in-progress)
    const activeWorkOrders = workOrdersResult.data.filter(
      wo => wo.status === 'pending' || wo.status === 'in-progress'
    ).length;

    // Calculate average completion time
    let totalCompletionDays = 0;
    const completedOrders = avgCompletionResult.data;
    completedOrders.forEach(order => {
      const createdDate = new Date(order.created_at);
      const completedDate = new Date(order.updated_at);
      const diffTime = Math.abs(completedDate - createdDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      totalCompletionDays += diffDays;
    });
    const avgCompletionDays = completedOrders.length > 0 
      ? (totalCompletionDays / completedOrders.length).toFixed(1)
      : 'N/A';

    // Get month-over-month change in active work orders
    const lastMonthDate = new Date();
    lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
    
    const lastMonthWorkOrdersResult = await supabase
      .from('work_orders')
      .select('id, status')
      .lt('created_at', lastMonthDate.toISOString());
    
    if (lastMonthWorkOrdersResult.error) throw lastMonthWorkOrdersResult.error;
    
    const lastMonthActiveWorkOrders = lastMonthWorkOrdersResult.data.filter(
      wo => wo.status === 'pending' || wo.status === 'in-progress'
    ).length;
    
    // Calculate percentage changes
    const workOrderChange = lastMonthActiveWorkOrders > 0 
      ? `${Math.round((activeWorkOrders - lastMonthActiveWorkOrders) / lastMonthActiveWorkOrders * 100)}%`
      : 'N/A';

    return {
      activeWorkOrders: activeWorkOrders.toString(),
      teamMembers: teamMembersResult.count?.toString() || '0',
      inventoryItems: inventoryResult.count?.toString() || '0',
      avgCompletionTime: `${avgCompletionDays} days`,
      workOrderChange,
      // For simplicity, using placeholder values for team and inventory change
      teamChange: "No change",
      inventoryChange: "+12%",
      completionTimeChange: "-8%"
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    throw error;
  }
};
