
import { supabase } from "@/lib/supabase";
import { ChecklistStat } from "@/types/dashboard";

// Get checklist completion statistics
export const getChecklistStats = async (): Promise<ChecklistStat[]> => {
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
