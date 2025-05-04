
import { supabase } from "@/lib/supabase";

/**
 * Records an activity for a work order
 * @param action The action performed (Created, Updated, etc.)
 * @param workOrderId The ID of the work order
 * @param userId The ID of the user who performed the action
 * @param userName The name of the user who performed the action
 */
export const recordWorkOrderActivity = async (
  action: string, 
  workOrderId: string, 
  userId: string,
  userName: string
): Promise<void> => {
  try {
    await supabase
      .from('work_order_activities')
      .insert({
        work_order_id: workOrderId,
        action: action,
        user_id: userId,
        user_name: userName
      });
  } catch (error) {
    console.error(`Error recording ${action} activity for work order:`, error);
  }
};

/**
 * Gets all activities for a specific work order
 * @param workOrderId The ID of the work order
 */
export const getWorkOrderActivities = async (workOrderId: string) => {
  try {
    const { data, error } = await supabase
      .from('work_order_activities')
      .select('*')
      .eq('work_order_id', workOrderId)
      .order('timestamp', { ascending: false });
      
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching work order activities:', error);
    return [];
  }
};
