
import { supabase } from "@/lib/supabase";

/**
 * Record an activity for a work order
 */
export async function recordWorkOrderActivity(
  action: string,
  workOrderId: string,
  userId: string,
  userName: string,
  flagged: boolean = false,
  flagReason?: string
): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('work_order_activities')
      .insert({
        work_order_id: workOrderId,
        action,
        user_id: userId,
        user_name: userName,
        flagged,
        flag_reason: flagReason,
        timestamp: new Date().toISOString()
      })
      .select('id')
      .single();
      
    if (error) throw error;
    
    return data.id;
  } catch (error) {
    console.error("Error recording work order activity:", error);
    return null;
  }
}

/**
 * Flag a suspicious activity
 */
export async function flagWorkOrderActivity(
  activityId: string,
  flagReason: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('work_order_activities')
      .update({
        flagged: true,
        flag_reason: flagReason
      })
      .eq('id', activityId);
      
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error("Error flagging activity:", error);
    return false;
  }
}

/**
 * Get all activities for a work order
 */
export async function getWorkOrderActivities(workOrderId: string) {
  try {
    const { data, error } = await supabase
      .from('work_order_activities')
      .select('*')
      .eq('work_order_id', workOrderId)
      .order('timestamp', { ascending: false });
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error("Error fetching work order activities:", error);
    return [];
  }
}
