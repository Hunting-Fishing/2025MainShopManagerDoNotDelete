
import { supabase } from "@/lib/supabase";
import { ChecklistStat } from "@/types/dashboard";

export const getChecklistStats = async (): Promise<ChecklistStat[]> => {
  try {
    // In a real application, you'd have a checklist_items table
    // Here we'll create placeholder data based on existing work orders
    const { data, error } = await supabase
      .from('work_orders')
      .select('id, status')
      .in('status', ['pending', 'in-progress'])
      .limit(5);
      
    if (error) throw error;
    
    if (!data || data.length === 0) return [];
    
    // Create checklist stats based on work orders
    // In real implementation, you would query real checklist data
    return data.map((workOrder, index) => {
      // Generate random but consistent required and completed items
      const requiredItems = 10 + (index % 5); // 10-14 items
      const completedRequiredItems = Math.floor(requiredItems * (0.4 + (index * 0.1))); // 40-80% complete
      
      return {
        work_order_id: workOrder.id,
        checklist_id: `checklist-${index+1}`,
        requiredItems,
        completedRequiredItems,
        completionRate: parseFloat((completedRequiredItems / requiredItems).toFixed(2))
      };
    });
  } catch (error) {
    console.error("Error generating checklist stats:", error);
    return [];
  }
};
