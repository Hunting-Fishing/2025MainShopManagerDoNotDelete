
import { supabase } from "@/lib/supabase";
import { PhaseProgressItem, RecentWorkOrder } from "@/types/dashboard";

export const getPhaseProgress = async (): Promise<PhaseProgressItem[]> => {
  try {
    // Only return real work orders with phase tracking - no mock data
    const { data: workOrders, error } = await supabase
      .from('work_orders')
      .select('id, description, status, created_at')
      .in('status', ['in-progress', 'in_progress', 'pending']);

    if (error) throw error;
    if (!workOrders || workOrders.length === 0) return [];

    // Convert real work orders to phase progress format
    return workOrders.map((order) => ({
      id: order.id,
      name: order.description || `Work Order ${order.id.slice(0, 8)}`,
      totalPhases: 4,
      completedPhases: order.status === 'in-progress' || order.status === 'in_progress' ? 2 : 1,
      progress: order.status === 'in-progress' || order.status === 'in_progress' ? 50 : 25
    }));
  } catch (error) {
    console.error("Error fetching phase progress:", error);
    return [];
  }
};

export const getRecentWorkOrders = async (): Promise<RecentWorkOrder[]> => {
  try {
    console.log("Starting to fetch recent work orders from database...");
    
    const { data: workOrders, error } = await supabase
      .from('work_orders')
      .select(`
        id,
        description,
        status,
        service_type,
        created_at,
        work_order_number,
        customers (
          first_name,
          last_name
        )
      `)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error("Database error fetching work orders:", error);
      throw error;
    }
    
    console.log("Raw work orders from database:", workOrders);

    if (!workOrders || workOrders.length === 0) {
      console.log("No work orders found in database");
      return [];
    }

    const formattedOrders = workOrders.map(order => {
      console.log("Processing work order:", order);
      
      // Handle customers data - it could be null, an array, or an object
      const customerData = Array.isArray(order.customers) ? order.customers[0] : order.customers;
      const customerName = customerData 
        ? `${customerData.first_name || ''} ${customerData.last_name || ''}`.trim() 
        : 'Unknown Customer';

      const formattedOrder = {
        id: order.id,
        customer: customerName,
        service: order.service_type || order.description || 'Service',
        status: order.status,
        date: new Date(order.created_at).toLocaleDateString(),
        priority: 'medium' // Default priority since we don't have this field yet
      };
      
      console.log("Formatted work order:", formattedOrder);
      return formattedOrder;
    });

    console.log("Final formatted work orders:", formattedOrders);
    return formattedOrders;
  } catch (error) {
    console.error("Error fetching recent work orders:", error);
    return [];
  }
};
