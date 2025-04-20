
import { supabase } from "@/lib/supabase";

/**
 * Records an activity for a work order
 */
export const recordWorkOrderActivity = async (
  action: string,
  workOrderId: string,
  userId: string,
  userName: string
): Promise<string | null> => {
  try {
    const { data, error } = await supabase.rpc('record_work_order_activity', {
      p_action: action,
      p_work_order_id: workOrderId,
      p_user_id: userId,
      p_user_name: userName
    });
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error("Error recording work order activity:", error);
    return null;
  }
};

/**
 * Get activities for a specific work order
 */
export const getWorkOrderActivity = async (workOrderId: string): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('work_order_activities')
      .select('*')
      .eq('work_order_id', workOrderId)
      .order('timestamp', { ascending: false });
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error("Error fetching work order activities:", error);
    throw error;
  }
};

/**
 * Flag an activity for review
 */
export const flagWorkOrderActivity = async (activityId: string, reason: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('work_order_activities')
      .update({ 
        flagged: true,
        flag_reason: reason 
      })
      .eq('id', activityId);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error("Error flagging work order activity:", error);
    return false;
  }
};

/**
 * Remove flag from an activity
 */
export const unflagWorkOrderActivity = async (activityId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('work_order_activities')
      .update({ 
        flagged: false,
        flag_reason: null 
      })
      .eq('id', activityId);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error("Error unflagging work order activity:", error);
    return false;
  }
};

/**
 * Get all flagged activities across work orders
 */
export const getFlaggedActivities = async (): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('work_order_activities')
      .select('*, work_orders(*)')
      .eq('flagged', true)
      .order('timestamp', { ascending: false });
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error("Error fetching flagged activities:", error);
    throw error;
  }
};
