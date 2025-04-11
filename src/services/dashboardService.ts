
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

// Get data for multi-phase work order progress
export const getPhaseProgressData = async () => {
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

// Get checklist completion statistics
export const getChecklistStats = async () => {
  try {
    const { data, error } = await supabase
      .from('work_order_checklist_assignments')
      .select(`
        id,
        work_order_id,
        checklist_id,
        checklist_items:checklist_items (
          id,
          is_required
        ),
        checklist_item_completions:checklist_item_completions (
          id,
          checklist_item_id
        )
      `);
      
    if (error) throw error;
    
    return data.map(assignment => {
      const items = assignment.checklist_items || [];
      const completions = assignment.checklist_item_completions || [];
      const requiredItems = items.filter(i => i.is_required).length;
      const completedRequiredItems = items
        .filter(i => i.is_required)
        .filter(i => completions.some(c => c.checklist_item_id === i.id))
        .length;
        
      return {
        work_order_id: assignment.work_order_id,
        checklist_id: assignment.checklist_id,
        requiredItems,
        completedRequiredItems,
        completionRate: requiredItems > 0 ? 
          Math.round((completedRequiredItems / requiredItems) * 100) : 0
      };
    });
  } catch (error) {
    console.error("Error fetching checklist stats:", error);
    return [];
  }
};

// Get technician efficiency metrics
export const getTechnicianEfficiency = async () => {
  try {
    const { data, error } = await supabase
      .from('work_order_time_entries')
      .select(`
        employee_id,
        employee_name,
        billable,
        duration
      `);
      
    if (error) throw error;
    
    // Group by technician
    const technicianMap = {};
    
    data.forEach(entry => {
      if (!technicianMap[entry.employee_id]) {
        technicianMap[entry.employee_id] = {
          id: entry.employee_id,
          name: entry.employee_name,
          totalHours: 0,
          billableHours: 0,
          efficiency: 0
        };
      }
      
      const hours = entry.duration / 60; // Convert minutes to hours
      technicianMap[entry.employee_id].totalHours += hours;
      
      if (entry.billable) {
        technicianMap[entry.employee_id].billableHours += hours;
      }
    });
    
    // Calculate efficiency ratios
    return Object.values(technicianMap).map(tech => {
      tech.efficiency = tech.totalHours > 0 ? 
        Math.round((tech.billableHours / tech.totalHours) * 100) : 0;
      return tech;
    });
  } catch (error) {
    console.error("Error fetching technician efficiency:", error);
    return [];
  }
};
