
import { supabase } from "@/lib/supabase";
import { DashboardStats } from "@/types/dashboard";

export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    // Get revenue from completed work orders
    const { data: revenueData, error: revenueError } = await supabase
      .from('work_orders')
      .select('total_cost')
      .eq('status', 'completed');
    
    if (revenueError) throw revenueError;
    
    const revenue = revenueData.reduce((sum, order) => 
      sum + (order.total_cost || 0), 0);
    
    // Get active work orders count
    const { count: activeOrders, error: activeOrdersError } = await supabase
      .from('work_orders')
      .select('*', { count: 'exact', head: true })
      .in('status', ['in-progress', 'pending']);
    
    if (activeOrdersError) throw activeOrdersError;
    
    // Get customer count
    const { count: customers, error: customersError } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true });
    
    if (customersError) throw customersError;
    
    // Get low stock parts count
    const { data: inventorySettings, error: settingsError } = await supabase
      .from('inventory_settings')
      .select('low_stock_threshold')
      .limit(1);
    
    if (settingsError) throw settingsError;
    
    const lowStockThreshold = inventorySettings?.[0]?.low_stock_threshold || 5;
    
    const { count: lowStockParts, error: lowStockError } = await supabase
      .from('inventory_items')
      .select('*', { count: 'exact', head: true })
      .lt('quantity', lowStockThreshold);
    
    if (lowStockError) throw lowStockError;
    
    // Get month-over-month changes
    const now = new Date();
    const lastMonth = new Date(now.setMonth(now.getMonth() - 1));
    const twoMonthsAgo = new Date(now.setMonth(now.getMonth() - 1));
    
    // Calculate month-over-month work order change
    const { count: currentMonthOrders } = await supabase
      .from('work_orders')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', lastMonth.toISOString());
      
    const { count: previousMonthOrders } = await supabase
      .from('work_orders')
      .select('*', { count: 'exact', head: true })
      .lt('created_at', lastMonth.toISOString())
      .gte('created_at', twoMonthsAgo.toISOString());
    
    const workOrderChange = previousMonthOrders > 0 
      ? `${Math.round((currentMonthOrders - previousMonthOrders) / previousMonthOrders * 100)}%` 
      : 'N/A';
    
    // Get active team members count (via profiles)
    const { count: teamMembers, error: teamError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });
      
    if (teamError) throw teamError;
      
    // Get inventory items count
    const { count: inventoryItems, error: inventoryError } = await supabase
      .from('inventory_items')
      .select('*', { count: 'exact', head: true });
      
    if (inventoryError) throw inventoryError;
      
    // Calculate average completion time
    const { data: completedOrders, error: completionError } = await supabase
      .from('work_orders')
      .select('created_at, end_time')
      .eq('status', 'completed')
      .not('end_time', 'is', null);
      
    if (completionError) throw completionError;
    
    let avgCompletionHours = 0;
    if (completedOrders && completedOrders.length > 0) {
      const totalHours = completedOrders.reduce((sum, order) => {
        const startDate = new Date(order.created_at);
        const endDate = new Date(order.end_time);
        const hours = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);
        return sum + hours;
      }, 0);
      avgCompletionHours = totalHours / completedOrders.length;
    }
    
    // Return formatted stats
    return {
      revenue,
      activeOrders: activeOrders || 0,
      customers: customers || 0,
      lowStockParts: lowStockParts || 0,
      activeWorkOrders: activeOrders?.toString() || '0',
      workOrderChange,
      teamMembers: teamMembers?.toString() || '0',
      teamChange: '0%', // Would need historical data for accurate calculation
      inventoryItems: inventoryItems?.toString() || '0',
      inventoryChange: '0%', // Would need historical data for accurate calculation
      avgCompletionTime: `${Math.round(avgCompletionHours)} hours`,
      completionTimeChange: '0%', // Would need historical data for accurate calculation
      customerSatisfaction: '95%', // This would need real feedback data
      phaseCompletionRate: '87%', // This would need real phase tracking data
      schedulingEfficiency: '92%', // This would need real scheduling data
      qualityControlPassRate: '98%', // This would need real QC data
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    // Return default values in case of error
    return {
      revenue: 0,
      activeOrders: 0,
      customers: 0,
      lowStockParts: 0,
      activeWorkOrders: '0',
      workOrderChange: '0%',
      teamMembers: '0',
      teamChange: '0%',
      inventoryItems: '0',
      inventoryChange: '0%',
      avgCompletionTime: '0 hours',
      completionTimeChange: '0%',
      customerSatisfaction: 'N/A',
      phaseCompletionRate: 'N/A',
      schedulingEfficiency: 'N/A',
      qualityControlPassRate: 'N/A',
    };
  }
};
