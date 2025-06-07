
import { supabase } from "@/integrations/supabase/client";
import { ChecklistStat } from "@/types/dashboard";

export const getChecklistStats = async (): Promise<ChecklistStat[]> => {
  try {
    // For now, return mock data since we don't have checklist functionality implemented
    // In a real implementation, this would query work order checklists
    const { data: workOrders } = await supabase
      .from('work_orders')
      .select('id')
      .limit(10);

    if (!workOrders) return [];

    // Generate mock checklist data
    return workOrders.map(order => ({
      work_order_id: order.id,
      checklist_id: `checklist-${order.id}`,
      requiredItems: Math.floor(Math.random() * 10) + 5,
      completedRequiredItems: Math.floor(Math.random() * 8) + 2,
      completionRate: Math.floor(Math.random() * 40) + 60 // 60-100%
    }));
  } catch (error) {
    console.error("Error fetching checklist stats:", error);
    return [];
  }
};
