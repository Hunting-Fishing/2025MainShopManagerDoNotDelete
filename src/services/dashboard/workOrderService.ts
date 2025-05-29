
import { supabase } from "@/lib/supabase";
import { PhaseProgressItem, RecentWorkOrder } from "@/types/dashboard";

export const getPhaseProgress = async (): Promise<PhaseProgressItem[]> => {
  try {
    // For now, return sample data since we don't have phase tracking implemented
    // In a real implementation, this would query work orders with phase information
    const { data: workOrders } = await supabase
      .from('work_orders')
      .select('id, description, status')
      .in('status', ['in-progress', 'pending'])
      .limit(5);

    if (!workOrders) return [];

    // Mock phase progress data based on work orders
    return workOrders.map((order, index) => ({
      id: order.id,
      name: order.description || `Work Order ${order.id.slice(0, 8)}`,
      totalPhases: 4,
      completedPhases: order.status === 'in-progress' ? 2 : 1,
      progress: order.status === 'in-progress' ? 50 : 25
    }));
  } catch (error) {
    console.error("Error fetching phase progress:", error);
    return [];
  }
};

export const getRecentWorkOrders = async (): Promise<RecentWorkOrder[]> => {
  try {
    const { data: workOrders, error } = await supabase
      .from('work_orders')
      .select(`
        id,
        description,
        status,
        service_type,
        created_at,
        customers (
          first_name,
          last_name
        )
      `)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;

    return workOrders?.map(order => ({
      id: order.id,
      customer: order.customers 
        ? `${(order.customers as any).first_name} ${(order.customers as any).last_name}` 
        : 'Unknown Customer',
      service: order.service_type || 'Service',
      status: order.status,
      date: new Date(order.created_at).toLocaleDateString(),
      priority: 'medium' // Default priority since we don't have this field yet
    })) || [];
  } catch (error) {
    console.error("Error fetching recent work orders:", error);
    return [];
  }
};
