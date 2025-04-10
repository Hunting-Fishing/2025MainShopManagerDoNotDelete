
import { supabase } from '@/lib/supabase';
import { TechnicianPerformance } from '@/types/dashboard';

// Get dashboard statistics
export async function getDashboardStats() {
  try {
    // Get active work orders count
    const { count: activeWorkOrders } = await supabase
      .from('work_orders')
      .select('*', { count: 'exact', head: true })
      .neq('status', 'completed')
      .neq('status', 'cancelled');

    // Get customer count
    const { count: customersCount } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true });

    // Get inventory items below threshold (low stock)
    const { data: lowStockItems } = await supabase
      .from('inventory_items')
      .select('*')
      .lt('quantity', 10);

    // Get total revenue from invoices (paid)
    const { data: invoiceData } = await supabase
      .from('invoices')
      .select('total')
      .eq('status', 'paid');

    const totalRevenue = invoiceData?.reduce((sum, invoice) => sum + (parseFloat(invoice.total) || 0), 0) || 0;

    return {
      revenue: totalRevenue,
      activeOrders: activeWorkOrders || 0,
      customers: customersCount || 0,
      lowStockParts: lowStockItems?.length || 0,
      // Map these to the expected structure
      activeWorkOrders: activeWorkOrders?.toString() || "0",
      workOrderChange: "+5%",
      teamMembers: "8",
      teamChange: "0%",
      inventoryItems: "245",
      inventoryChange: "-2%",
      avgCompletionTime: "4.2h",
      completionTimeChange: "-8%"
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      revenue: 0,
      activeOrders: 0,
      customers: 0,
      lowStockParts: 0,
      // Also provide defaults for expected structure
      activeWorkOrders: "0",
      workOrderChange: "0%",
      teamMembers: "0",
      teamChange: "0%",
      inventoryItems: "0",
      inventoryChange: "0%",
      avgCompletionTime: "0h",
      completionTimeChange: "0%"
    };
  }
}

// Get recent work orders with customer information
export async function getRecentWorkOrders() {
  try {
    const { data, error } = await supabase
      .from('work_orders')
      .select(`
        *,
        customers (
          first_name,
          last_name
        )
      `)
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) throw error;

    if (!data) return [];

    // Transform data to match expected format
    return data.map(order => {
      // Safely access the customer data
      const customers = order.customers;
      const customer = Array.isArray(customers) && customers.length > 0
        ? customers[0]
        : { first_name: '', last_name: '' };

      const customerName = customer 
        ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim()
        : 'Unknown Customer';

      return {
        id: order.id,
        customer: customerName,
        service: order.description || 'General Service',
        status: order.status || 'pending',
        date: new Date(order.created_at).toLocaleDateString(),
        priority: order.status === 'pending' ? 'High' : 
                 order.status === 'in-progress' ? 'Medium' : 'Low'
      };
    });
  } catch (error) {
    console.error('Error fetching recent work orders:', error);
    return [];
  }
}

// Get technician performance metrics
export async function getTechnicianPerformance(): Promise<TechnicianPerformance> {
  try {
    // Get team members who are technicians
    const { data: techData, error: techError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name')
      .eq('job_title', 'Technician');

    if (techError) throw techError;
    
    if (!techData || techData.length === 0) {
      return { chartData: [], technicians: [] };
    }
    
    // Get work order data
    const { data: workOrderData, error: woError } = await supabase
      .from('work_orders')
      .select('*')
      .in('technician_id', techData.map(tech => tech.id));

    if (woError) throw woError;
    
    // Get months (last 6 months)
    const months = getLastSixMonths();
    
    // Create chart data structure
    const chartData = months.map(month => {
      const monthObj = { month };
      
      techData.forEach(tech => {
        const techName = `${tech.first_name} ${tech.last_name}`;
        const techKey = techName.toLowerCase().replace(/\s+/g, '_');
        
        // Count completed orders for this tech in this month
        const completedOrders = workOrderData?.filter(wo => {
          const woDate = new Date(wo.created_at);
          return wo.technician_id === tech.id && 
                 wo.status === 'completed' &&
                 woDate.getMonth() === new Date(month + ' 1, 2023').getMonth();
        }).length || 0;
        
        monthObj[techKey] = completedOrders;
      });
      
      return monthObj;
    });
    
    return {
      chartData,
      technicians: techData.map(tech => `${tech.first_name} ${tech.last_name}`)
    };
  } catch (error) {
    console.error('Error fetching technician performance:', error);
    return { chartData: [], technicians: [] };
  }
}

// Get work orders by status for pie chart
export async function getWorkOrdersByStatus() {
  try {
    // Get counts by status
    const { data, error } = await supabase
      .from('work_orders')
      .select('status')
      .then(result => {
        if (result.error) throw result.error;
        
        // Count occurrences of each status
        const counts = {};
        result.data?.forEach(order => {
          const status = order.status;
          counts[status] = (counts[status] || 0) + 1;
        });
        
        // Convert to array format
        return {
          data: Object.keys(counts).map(status => ({
            name: status.charAt(0).toUpperCase() + status.slice(1),
            value: counts[status]
          })),
          error: null
        };
      });

    if (error) throw error;
    
    if (!data) return [];
    
    return data;
    
  } catch (error) {
    console.error('Error fetching work order status data:', error);
    return [];
  }
}

// Get work order status counts specifically for the WorkOrdersByStatusChart
export async function getWorkOrderStatusCounts() {
  try {
    // Get counts by status
    const { data, error } = await supabase
      .from('work_orders')
      .select('status')
      .then(result => {
        if (result.error) throw result.error;
        
        // Count occurrences of each status
        const counts = {};
        result.data?.forEach(order => {
          const status = order.status;
          counts[status] = (counts[status] || 0) + 1;
        });
        
        // Convert to array format
        return {
          data: Object.keys(counts).map(status => ({
            name: status.charAt(0).toUpperCase() + status.slice(1),
            value: counts[status]
          })),
          error: null
        };
      });
      
    if (error) throw error;
    
    if (!data) return [];
    
    return data;
  } catch (error) {
    console.error('Error fetching work order status counts:', error);
    return [];
  }
}

// Get monthly revenue
export async function getMonthlyRevenue() {
  try {
    // Get the invoices from the last 12 months
    const oneYearAgo = new Date();
    oneYearAgo.setMonth(oneYearAgo.getMonth() - 12);
    
    const { data, error } = await supabase
      .from('invoices')
      .select('total, date')
      .gte('date', oneYearAgo.toISOString().split('T')[0]);
      
    if (error) throw error;
    
    if (!data) return [];
    
    // Group by month
    const revenues = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    data.forEach(invoice => {
      const date = new Date(invoice.date);
      const monthIndex = date.getMonth();
      const monthName = months[monthIndex];
      
      if (!revenues[monthName]) {
        revenues[monthName] = 0;
      }
      
      revenues[monthName] += parseFloat(invoice.total) || 0;
    });
    
    // Convert to array format for chart
    return Object.keys(revenues).map(month => ({
      month,
      revenue: revenues[month]
    }));
  } catch (error) {
    console.error('Error fetching monthly revenue:', error);
    return [];
  }
}

// Get service type distribution for radar chart
export async function getServiceTypeDistribution() {
  try {
    // Get work orders with descriptions
    const { data, error } = await supabase
      .from('work_orders')
      .select('description');
      
    if (error) throw error;
    
    if (!data) return [];
    
    // Define common service types for categorization
    const serviceTypes = [
      'Oil Change',
      'Brake Service',
      'Tire Replacement',
      'Engine Repair',
      'Transmission',
      'Electrical',
      'Diagnostics',
      'Other'
    ];
    
    // Count occurrences of each service type
    const counts = {};
    serviceTypes.forEach(type => counts[type] = 0);
    
    data.forEach(wo => {
      const desc = wo.description ? wo.description.toLowerCase() : '';
      
      if (desc.includes('oil') || desc.includes('lube')) {
        counts['Oil Change']++;
      } else if (desc.includes('brake') || desc.includes('rotor') || desc.includes('pad')) {
        counts['Brake Service']++;
      } else if (desc.includes('tire') || desc.includes('wheel')) {
        counts['Tire Replacement']++;
      } else if (desc.includes('engine') || desc.includes('motor')) {
        counts['Engine Repair']++;
      } else if (desc.includes('transmission') || desc.includes('clutch')) {
        counts['Transmission']++;
      } else if (desc.includes('electric') || desc.includes('battery')) {
        counts['Electrical']++;
      } else if (desc.includes('diagnos') || desc.includes('scan') || desc.includes('check')) {
        counts['Diagnostics']++;
      } else {
        counts['Other']++;
      }
    });
    
    // Format for radar chart
    return serviceTypes.map(type => ({
      subject: type,
      value: counts[type]
    }));
  } catch (error) {
    console.error('Error fetching service type distribution:', error);
    return [];
  }
}

// Get equipment recommendations for maintenance
export async function getEquipmentRecommendations() {
  try {
    const { data, error } = await supabase
      .from('equipment')
      .select('*')
      .order('next_maintenance_date', { ascending: true })
      .limit(5);

    if (error) throw error;
    
    if (!data) return [];
    
    // Transform to match expected format
    return data.map(equip => ({
      id: equip.id.toString(),
      name: equip.name,
      model: equip.model,
      manufacturer: equip.manufacturer,
      maintenanceDate: equip.next_maintenance_date,
      maintenanceType: equip.maintenance_frequency,
      status: equip.status,
      priority: determinePriority(equip.next_maintenance_date, equip.status)
    }));
  } catch (error) {
    console.error('Error fetching equipment recommendations:', error);
    return [];
  }
}

// Helper function to get the last six months
function getLastSixMonths() {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const result = [];
  
  const date = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(date);
    d.setMonth(d.getMonth() - i);
    result.push(months[d.getMonth()]);
  }
  
  return result;
}

// Helper function to determine priority based on maintenance date and status
function determinePriority(maintenanceDate: string, status: string): 'High' | 'Medium' | 'Low' {
  if (!maintenanceDate) return 'Medium';
  
  const now = new Date();
  const maintenance = new Date(maintenanceDate);
  const diffDays = Math.floor((maintenance.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  if (status === 'Needs Attention' || diffDays < 0) {
    return 'High';
  } else if (diffDays < 30) {
    return 'Medium';
  } else {
    return 'Low';
  }
}
