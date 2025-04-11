
import { supabase } from "@/lib/supabase";
import { PhaseProgressItem, RecentWorkOrder } from "@/types/dashboard";

// Get phase progress data
export const getPhaseProgress = async (): Promise<PhaseProgressItem[]> => {
  try {
    // Get work orders with their statuses
    const { data, error } = await supabase
      .from('work_orders')
      .select(`
        id, 
        description,
        status,
        customer_id
      `)
      .in('status', ['pending', 'in-progress', 'on-hold', 'waiting-parts']);
      
    if (error) throw error;
    
    if (!data || data.length === 0) return [];
    
    // Map work orders to phase progress format
    return data.map(workOrder => {
      // Calculate progress based on status
      let progress = 0;
      let completedPhases = 0;
      const totalPhases = 5; // Assuming a 5-phase workflow
      
      switch (workOrder.status) {
        case 'pending':
          progress = 20;
          completedPhases = 1;
          break;
        case 'in-progress':
          progress = 40;
          completedPhases = 2;
          break;
        case 'waiting-parts':
          progress = 60;
          completedPhases = 3;
          break;
        case 'on-hold':
          progress = 80;
          completedPhases = 4;
          break;
        default:
          progress = 0;
          completedPhases = 0;
      }
      
      return {
        id: workOrder.id,
        name: workOrder.description || `Work Order #${workOrder.id.substring(0, 8)}`,
        totalPhases,
        completedPhases,
        progress
      };
    });
  } catch (error) {
    console.error("Error fetching phase progress:", error);
    return [];
  }
};

// Get recent work orders
export const getRecentWorkOrders = async (): Promise<RecentWorkOrder[]> => {
  try {
    // Get recent work orders with customer information
    const { data, error } = await supabase
      .from('work_orders')
      .select(`
        id, 
        description,
        status,
        created_at,
        customer_id,
        customers (
          first_name,
          last_name
        )
      `)
      .order('created_at', { ascending: false })
      .limit(5);
      
    if (error) throw error;
    
    if (!data || data.length === 0) return [];
    
    // Map to required format
    return data.map(order => {
      const customer = order.customers || { first_name: 'Unknown', last_name: 'Customer' };
      const customerName = customer ? `${customer.first_name} ${customer.last_name}` : 'Unknown Customer';
        
      // Determine priority based on status
      let priority = 'normal';
      if (order.status === 'waiting-parts') priority = 'medium';
      if (order.status === 'on-hold') priority = 'high';
      
      return {
        id: order.id,
        customer: customerName,
        service: order.description || 'General Service',
        status: order.status || 'pending',
        date: new Date(order.created_at).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        }),
        priority
      };
    });
  } catch (error) {
    console.error("Error fetching recent work orders:", error);
    return [];
  }
};
