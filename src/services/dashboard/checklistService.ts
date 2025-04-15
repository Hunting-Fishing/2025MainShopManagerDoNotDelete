
import { supabase } from "@/lib/supabase";
import { ChecklistStat } from "@/types/dashboard";

export const getChecklistStats = async (): Promise<ChecklistStat[]> => {
  try {
    // Fetch checklist completion stats from the quality_control_checklists table
    const { data, error } = await supabase
      .from('quality_control_checklists')
      .select('name, items_total, items_completed, last_updated')
      .order('last_updated', { ascending: false })
      .limit(5);

    if (error) {
      console.error("Error fetching checklist stats:", error);
      return [];
    }

    // Transform the data to calculate completion rates
    return data.map(checklist => ({
      name: checklist.name,
      completionRate: checklist.items_total > 0 
        ? Math.round((checklist.items_completed / checklist.items_total) * 100)
        : 0,
      lastUpdated: checklist.last_updated
    }));
  } catch (error) {
    console.error("Error in getChecklistStats:", error);
    return [];
  }
};

export const getQualityControlStats = async (): Promise<{ passRate: string }> => {
  try {
    // Fetch the latest quality control pass rate
    const { data, error } = await supabase
      .from('quality_control_metrics')
      .select('pass_rate')
      .order('calculated_at', { ascending: false })
      .limit(1);
    
    if (error) throw error;
    
    return {
      passRate: data && data.length > 0 ? `${Math.round(data[0].pass_rate)}%` : 'N/A'
    };
  } catch (error) {
    console.error("Error fetching quality control stats:", error);
    return { passRate: 'N/A' };
  }
};
