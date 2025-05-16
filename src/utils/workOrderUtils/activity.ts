
import { supabase } from "@/lib/supabase";

/**
 * Log activity on a work order
 */
export const logWorkOrderActivity = async (
  workOrderId: string, 
  action: string, 
  userId: string,
  userName: string,
  flagged: boolean = false,
  flagReason?: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('work_order_activities')
      .insert([{
        work_order_id: workOrderId,
        action,
        user_id: userId,
        user_name: userName,
        flagged,
        flag_reason: flagReason,
        timestamp: new Date().toISOString()
      }]);
      
    if (error) {
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error logging work order activity:', error);
    return false;
  }
};

/**
 * Get activity history for a work order
 */
export const getWorkOrderActivities = async (workOrderId: string) => {
  try {
    const { data, error } = await supabase
      .from('work_order_activities')
      .select('*')
      .eq('work_order_id', workOrderId)
      .order('timestamp', { ascending: false });
      
    if (error) {
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching work order activities:', error);
    return [];
  }
};

/**
 * Get flagged activities
 */
export const getFlaggedActivities = async () => {
  try {
    const { data, error } = await supabase
      .from('work_order_activities')
      .select('*')
      .eq('flagged', true)
      .order('timestamp', { ascending: false });
      
    if (error) {
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching flagged activities:', error);
    return [];
  }
};

/**
 * Flag an activity
 */
export const flagActivity = async (
  activityId: string, 
  reason: string, 
  userId: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('flagged_activities')
      .insert([{
        activity_id: activityId,
        flag_reason: reason,
        flagged_by: userId,
        activity_type: 'work_order'
      }]);
      
    if (error) {
      throw error;
    }
    
    // Update the activity to mark it as flagged
    const { error: updateError } = await supabase
      .from('work_order_activities')
      .update({ flagged: true, flag_reason: reason })
      .eq('id', activityId);
      
    if (updateError) {
      throw updateError;
    }
    
    return true;
  } catch (error) {
    console.error('Error flagging activity:', error);
    return false;
  }
};
