import { supabase } from "@/lib/supabase";
import { PhaseProgressItem, RecentWorkOrder, ServiceTypeData } from "@/types/dashboard";
import { SERVICE_TYPES, getServiceTypeFromDescription } from "../serviceTypes";

// Fetch data for the work order phases chart
export const getWorkOrderPhaseData = async () => {
  try {
    const { data, error } = await supabase
      .from('work_order_phases')
      .select('status, work_order_id')
      .order('created_at', { ascending: false })
      .limit(100); // Limit to recent phases for performance
    
    if (error) throw error;
    
    const statusCounts = {
      pending: 0,
      in_progress: 0,
      completed: 0,
      cancelled: 0
    };
    
    // Count phases by status
    data.forEach(phase => {
      const status = phase.status.replace('-', '_');
      if (statusCounts[status] !== undefined) {
        statusCounts[status]++;
      }
    });
    
    // Convert to chart format
    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' '),
      value: count
    }));
  } catch (error) {
    console.error("Error fetching work order phase data:", error);
    return [];
  }
};

// Get work orders breakdown by status
export const getWorkOrdersByStatus = async () => {
  try {
    const { data, error } = await supabase
      .from('work_orders')
      .select('status, id')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Count work orders by status
    const statusCounts = {
      pending: 0,
      'in-progress': 0,
      completed: 0,
      cancelled: 0
    };
    
    // Group by status
    data.forEach(order => {
      const status = order.status || 'pending';
      if (statusCounts[status] !== undefined) {
        statusCounts[status]++;
      }
    });
    
    // Convert to chart format
    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' '),
      value: count
    }));
  } catch (error) {
    console.error("Error fetching work orders by status:", error);
    return [];
  }
};

// Get data for multi-phase work order progress
export const getPhaseProgressData = async (): Promise<PhaseProgressItem[]> => {
  try {
    const { data, error } = await supabase
      .from('work_orders')
      .select(`
        id,
        description,
        work_order_phases (
          id,
          name,
          status,
          position
        )
      `)
      .order('created_at', { ascending: false })
      .limit(5); // Limit to most recent work orders
      
    if (error) throw error;
    
    return data.map(wo => {
      const phases = wo.work_order_phases || [];
      const totalPhases = phases.length;
      const completedPhases = phases.filter(p => p.status === 'completed').length;
      const progress = totalPhases > 0 ? Math.round((completedPhases / totalPhases) * 100) : 0;
      
      return {
        id: wo.id,
        name: wo.description || `Work Order #${wo.id.substring(0, 8)}`,
        totalPhases,
        completedPhases,
        progress
      };
    });
  } catch (error) {
    console.error("Error fetching phase progress data:", error);
    return [];
  }
};

// Get recent work orders for the dashboard
export const getRecentWorkOrders = async (): Promise<RecentWorkOrder[]> => {
  try {
    const { data, error } = await supabase
      .from('work_orders')
      .select(`
        id,
        status,
        priority,
        created_at,
        description,
        customers(first_name, last_name),
        service_type
      `)
      .order('created_at', { ascending: false })
      .limit(5); // Get only the 5 most recent orders
    
    if (error) throw error;
    
    if (!data || data.length === 0) return [];
    
    return data.map(order => {
      const customer = order.customers ? 
        `${order.customers.first_name || ''} ${order.customers.last_name || ''}`.trim() : 
        'Unknown Customer';
      
      // Format the date as a string
      const orderDate = new Date(order.created_at);
      const formattedDate = orderDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
      
      return {
        id: order.id,
        customer: customer,
        service: order.service_type || order.description?.substring(0, 30) || 'General Service',
        status: order.status || 'pending',
        date: formattedDate,
        priority: order.priority || 'medium'
      };
    });
  } catch (error) {
    console.error("Error fetching recent work orders:", error);
    return [];
  }
};

// Get service type distribution for the dashboard pie chart
export const getServiceTypeDistribution = async (): Promise<ServiceTypeData[]> => {
  try {
    const { data, error } = await supabase
      .from('work_orders')
      .select(`
        id,
        description,
        service_type
      `)
      .limit(200); // Limit to most recent work orders for better performance
    
    if (error) throw error;
    
    // Initialize counts for all service types
    const serviceTypeCounts: Record<string, number> = {};
    
    // Initialize with zero counts for all known service types
    SERVICE_TYPES.forEach(type => {
      serviceTypeCounts[type] = 0;
    });
    
    // Count work orders by service type
    data.forEach(order => {
      // Use the existing service_type field if available, otherwise determine from description
      const serviceType = order.service_type || 
                          (order.description ? getServiceTypeFromDescription(order.description) : 'Other');
      
      if (serviceTypeCounts[serviceType] !== undefined) {
        serviceTypeCounts[serviceType]++;
      } else {
        serviceTypeCounts['Other'] = (serviceTypeCounts['Other'] || 0) + 1;
      }
    });
    
    // Convert to chart format, filtering out types with zero counts
    return Object.entries(serviceTypeCounts)
      .filter(([_, count]) => count > 0)
      .map(([subject, value]) => ({
        subject,
        value
      }));
      
  } catch (error) {
    console.error("Error fetching service type distribution:", error);
    return [];
  }
};
