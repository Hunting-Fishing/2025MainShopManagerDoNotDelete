
import { supabase } from "@/lib/supabase";
import { DashboardStats } from "@/types/dashboard";

// Get dashboard statistics including advanced work order metrics
export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    // Fetch work order counts by status
    const { data: workOrdersData, error: workOrdersError } = await supabase
      .from('work_orders')
      .select('id, status, created_at');
    
    if (workOrdersError) throw workOrdersError;
    
    // Fetch team member count
    const { data: teamMembers, error: teamError } = await supabase
      .from('profiles')
      .select('id');
    
    if (teamError) throw teamError;
    
    // Fetch inventory stats
    const { data: inventoryItems, error: inventoryError } = await supabase
      .from('inventory_items')
      .select('id, quantity, reorder_point');
    
    if (inventoryError) throw inventoryError;
    
    // Fetch work order phases
    const { data: phases, error: phasesError } = await supabase
      .from('work_order_phases')
      .select('id, status');
    
    const phaseData = phases || [];
    
    // Calculate low stock items
    const lowStockItems = inventoryItems ? 
      inventoryItems.filter(item => item.quantity <= item.reorder_point).length : 0;
    
    // Count active work orders
    const activeWorkOrders = workOrdersData ? 
      workOrdersData.filter(wo => wo.status === 'pending' || wo.status === 'in-progress').length : 0;
    
    // Calculate month-over-month change
    const now = new Date();
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    const { data: lastMonthOrders } = await supabase
      .from('work_orders')
      .select('id, status')
      .lt('created_at', lastMonth.toISOString());
      
    const lastMonthActive = lastMonthOrders ? 
      lastMonthOrders.filter(wo => wo.status === 'pending' || wo.status === 'in-progress').length : 0;
      
    const workOrderChange = lastMonthActive > 0 ? 
      `${Math.round(((activeWorkOrders - lastMonthActive) / lastMonthActive) * 100)}%` : "0%";
    
    // Calculate average completion time
    const { data: completedOrders } = await supabase
      .from('work_orders')
      .select('created_at, updated_at')
      .eq('status', 'completed');
    
    let avgCompletionDays = "0";
    if (completedOrders && completedOrders.length > 0) {
      const totalDays = completedOrders.reduce((sum, order) => {
        const createdDate = new Date(order.created_at);
        const completedDate = new Date(order.updated_at);
        const diffTime = Math.abs(completedDate.getTime() - createdDate.getTime());
        return sum + Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }, 0);
      avgCompletionDays = (totalDays / completedOrders.length).toFixed(1);
    }
    
    // Get customer satisfaction metrics
    const { data: metrics } = await supabase
      .from('work_order_metrics')
      .select('customer_satisfaction_score')
      .not('customer_satisfaction_score', 'is', null);
    
    const avgSatisfaction = metrics && metrics.length > 0 ?
      metrics.reduce((sum, m) => sum + m.customer_satisfaction_score, 0) / metrics.length : 0;
    
    // Phase completion statistics
    const totalPhases = phaseData.length;
    const completedPhases = phaseData.filter(p => p.status === 'completed').length;
    const phaseCompletionRate = totalPhases > 0 ? 
      Math.round((completedPhases / totalPhases) * 100) : 0;
    
    return {
      revenue: 0, // This would need to be calculated from invoices
      activeOrders: activeWorkOrders,
      customers: 0, // This would be calculated from customers table
      lowStockParts: lowStockItems,
      activeWorkOrders: activeWorkOrders.toString(),
      workOrderChange,
      teamMembers: teamMembers ? teamMembers.length.toString() : "0",
      teamChange: "0", // Would need historical data
      inventoryItems: inventoryItems ? inventoryItems.length.toString() : "0",
      inventoryChange: "0%", // Would need historical data
      avgCompletionTime: `${avgCompletionDays} days`,
      completionTimeChange: "0%", // Would need historical data
      customerSatisfaction: avgSatisfaction.toFixed(1),
      phaseCompletionRate: `${phaseCompletionRate}%`,
      schedulingEfficiency: "87%", // Placeholder - would need actual calculation
      qualityControlPassRate: "94%", // Placeholder - would need actual calculation
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    // Return default values if there's an error
    return {
      revenue: 0,
      activeOrders: 0,
      customers: 0,
      lowStockParts: 0,
      activeWorkOrders: "0",
      workOrderChange: "0%",
      teamMembers: "0",
      teamChange: "0",
      inventoryItems: "0",
      inventoryChange: "0%",
      avgCompletionTime: "0 days",
      completionTimeChange: "0%",
      customerSatisfaction: "0",
      phaseCompletionRate: "0%",
      schedulingEfficiency: "0%",
      qualityControlPassRate: "0%",
    };
  }
};
