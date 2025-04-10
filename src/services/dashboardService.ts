
import { supabase } from '@/lib/supabase';

// Get monthly revenue data for the dashboard
export async function getMonthlyRevenue() {
  try {
    // Get current date information
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    
    // Create a date 6 months ago
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(currentDate.getMonth() - 6);
    
    // Format as ISO date string for Supabase query
    const fromDate = sixMonthsAgo.toISOString();
    
    // Query invoices grouped by month
    const { data, error } = await supabase
      .from('invoices')
      .select('date, total')
      .gte('date', fromDate.split('T')[0])
      .order('date', { ascending: true });
    
    if (error) {
      throw error;
    }
    
    // Process the data by grouping into months
    const monthlyData = {};
    
    // Initialize with zero values for the past 6 months
    for (let i = 0; i < 6; i++) {
      const month = new Date();
      month.setMonth(currentDate.getMonth() - 5 + i);
      const monthKey = month.toLocaleString('default', { month: 'short' });
      monthlyData[monthKey] = 0;
    }
    
    // Fill in actual data
    data?.forEach(invoice => {
      const invoiceDate = new Date(invoice.date);
      const monthKey = invoiceDate.toLocaleString('default', { month: 'short' });
      
      // Only include data from current year
      if (invoiceDate.getFullYear() === currentYear) {
        monthlyData[monthKey] = (monthlyData[monthKey] || 0) + Number(invoice.total);
      }
    });
    
    // Convert to array format for chart
    return Object.entries(monthlyData).map(([month, revenue]) => ({
      month,
      revenue: Number(revenue)
    }));
    
  } catch (error) {
    console.error('Error fetching monthly revenue data:', error);
    return [];
  }
}

// Get work order status counts for the dashboard
export async function getWorkOrderStatusCounts() {
  try {
    // Query work orders grouped by status
    const { data, error } = await supabase
      .from('work_orders')
      .select('status, count')
      .select('status')
      .order('status');
    
    if (error) {
      throw error;
    }
    
    // Count occurrences of each status
    const statusCounts = {};
    data.forEach(order => {
      statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
    });
    
    // Convert to array format for chart
    return Object.entries(statusCounts).map(([name, value]) => ({
      name,
      value
    }));
    
  } catch (error) {
    console.error('Error fetching work order status counts:', error);
    return [];
  }
}

// Get technician performance data for the dashboard
export async function getTechnicianPerformance() {
  try {
    // Query work orders with technician info and completion time
    const { data, error } = await supabase
      .from('work_orders')
      .select('technician_id, status, estimated_hours, created_at, updated_at')
      .in('status', ['Completed', 'Closed'])
      .order('technician_id');
    
    if (error) {
      throw error;
    }
    
    // Get unique technicians
    const technicianMap = {};
    data.forEach(order => {
      if (!order.technician_id) return;
      
      if (!technicianMap[order.technician_id]) {
        technicianMap[order.technician_id] = {
          id: order.technician_id,
          name: `Tech ${order.technician_id.substring(0, 6)}`, // Use actual technician name if available
          completedOrders: 0,
          estimatedHours: 0,
          actualHours: 0
        };
      }
      
      const tech = technicianMap[order.technician_id];
      tech.completedOrders++;
      
      // Add estimated hours if available
      if (order.estimated_hours) {
        tech.estimatedHours += Number(order.estimated_hours);
      }
      
      // Calculate actual hours based on creation and update times
      if (order.created_at && order.updated_at) {
        const created = new Date(order.created_at);
        const updated = new Date(order.updated_at);
        const hoursDiff = (updated.getTime() - created.getTime()) / (1000 * 60 * 60);
        tech.actualHours += hoursDiff;
      }
    });
    
    // Convert to array format for chart
    return Object.values(technicianMap).map(tech => ({
      name: tech.name,
      completedOrders: tech.completedOrders,
      efficiency: tech.estimatedHours > 0 ? Math.round((tech.estimatedHours / tech.actualHours) * 100) : 100
    }));
    
  } catch (error) {
    console.error('Error fetching technician performance data:', error);
    return [];
  }
}

// Get service type distribution data for the dashboard
export async function getServiceTypeDistribution() {
  try {
    // Query work orders grouped by service type
    const { data, error } = await supabase
      .from('work_orders')
      .select('description')
      .not('description', 'is', null);
    
    if (error) {
      throw error;
    }
    
    // Extract service types from descriptions (simplified approach)
    const serviceTypes = {
      "Maintenance": 0,
      "Repair": 0,
      "Installation": 0,
      "Inspection": 0,
      "Diagnosis": 0,
      "Emergency": 0
    };
    
    // Simple keyword matching to categorize service types
    data.forEach(order => {
      const description = order.description?.toLowerCase() || '';
      
      if (description.includes('maintenance') || description.includes('tune')) {
        serviceTypes["Maintenance"]++;
      } else if (description.includes('repair') || description.includes('fix')) {
        serviceTypes["Repair"]++;
      } else if (description.includes('install') || description.includes('replacement')) {
        serviceTypes["Installation"]++;
      } else if (description.includes('inspect') || description.includes('check')) {
        serviceTypes["Inspection"]++;
      } else if (description.includes('diagnos') || description.includes('troubleshoot')) {
        serviceTypes["Diagnosis"]++;
      } else if (description.includes('emergency') || description.includes('urgent')) {
        serviceTypes["Emergency"]++;
      } else {
        // Default to maintenance
        serviceTypes["Maintenance"]++;
      }
    });
    
    // Convert to array format for chart
    return Object.entries(serviceTypes).map(([subject, value]) => ({
      subject,
      value
    }));
    
  } catch (error) {
    console.error('Error fetching service type distribution data:', error);
    return [];
  }
}

// Get dashboard statistics
export async function getDashboardStats() {
  try {
    // Get current date and date for 30 days ago
    const currentDate = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(currentDate.getDate() - 30);
    
    // Format dates for queries
    const today = currentDate.toISOString().split('T')[0];
    const pastMonth = thirtyDaysAgo.toISOString().split('T')[0];
    
    // Calculate revenue this month
    const { data: revenueData, error: revenueError } = await supabase
      .from('invoices')
      .select('total')
      .gte('date', pastMonth);
      
    if (revenueError) throw revenueError;
    
    const monthlyRevenue = revenueData.reduce((sum, invoice) => sum + Number(invoice.total), 0);
    
    // Count active work orders
    const { data: activeOrdersData, error: activeOrdersError } = await supabase
      .from('work_orders')
      .select('count')
      .in('status', ['In Progress', 'Scheduled', 'On Hold'])
      .count();
      
    if (activeOrdersError) throw activeOrdersError;
    
    const activeOrders = activeOrdersData || 0;
    
    // Count customers with work in last 30 days
    const { data: customerData, error: customerError } = await supabase
      .from('work_orders')
      .select('customer_id')
      .gte('created_at', pastMonth)
      .not('customer_id', 'is', null);
      
    if (customerError) throw customerError;
    
    // Count unique customers
    const uniqueCustomers = new Set(customerData.map(order => order.customer_id)).size;
    
    // Count parts with low inventory
    const { data: partsData, error: partsError } = await supabase
      .from('inventory_items')
      .select('count')
      .lte('quantity', 'reorder_point')
      .count();
      
    if (partsError) throw partsError;
    
    const lowStockItems = partsData || 0;
    
    return {
      revenue: monthlyRevenue,
      activeOrders,
      customers: uniqueCustomers,
      lowStockParts: lowStockItems
    };
    
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      revenue: 0,
      activeOrders: 0,
      customers: 0,
      lowStockParts: 0
    };
  }
}

// Get recent work orders for the dashboard
export async function getRecentWorkOrders(limit = 5) {
  try {
    const { data, error } = await supabase
      .from('work_orders')
      .select('*, customers(first_name, last_name)')
      .order('created_at', { ascending: false })
      .limit(limit);
      
    if (error) throw error;
    
    return data.map(order => {
      const customer = order.customers;
      return {
        ...order,
        customerName: customer ? `${customer.first_name} ${customer.last_name}` : 'Unknown Customer'
      };
    });
    
  } catch (error) {
    console.error('Error fetching recent work orders:', error);
    return [];
  }
}

// Get equipment maintenance recommendations
export async function getEquipmentRecommendations() {
  try {
    const { data, error } = await supabase
      .from('equipment')
      .select('*')
      .lte('next_maintenance_date', new Date().toISOString().split('T')[0])
      .order('next_maintenance_date', { ascending: true });
      
    if (error) throw error;
    
    return data.map(item => {
      // Calculate priority based on how overdue the maintenance is
      const nextDate = new Date(item.next_maintenance_date);
      const daysPassed = Math.floor((new Date().getTime() - nextDate.getTime()) / (1000 * 60 * 60 * 24));
      
      let priority: 'High' | 'Medium' | 'Low' = 'Medium';
      if (daysPassed > 30) {
        priority = 'High';
      } else if (daysPassed < 7) {
        priority = 'Low';
      }
      
      return {
        id: item.id,
        name: item.name,
        model: item.model,
        manufacturer: item.manufacturer,
        maintenanceDate: item.next_maintenance_date,
        maintenanceType: item.maintenance_frequency,
        status: item.status,
        priority: priority
      };
    });
    
  } catch (error) {
    console.error('Error fetching equipment recommendations:', error);
    return [];
  }
}
