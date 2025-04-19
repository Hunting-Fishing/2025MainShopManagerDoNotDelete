
import { supabase } from "@/lib/supabase";

export const recordWorkOrderActivity = async (
  action: string,
  workOrderId: string,
  userId: string,
  userName: string,
  flagged: boolean = false,
  flagReason?: string
): Promise<{success: boolean; error?: string}> => {
  try {
    // First check if we have a Supabase function for this
    try {
      const { data, error } = await supabase.rpc('record_work_order_activity', {
        p_action: action,
        p_work_order_id: workOrderId,
        p_user_id: userId,
        p_user_name: userName
      });
      
      if (!error) {
        return { success: true };
      }
      
      // If RPC call didn't work, fall back to direct insert
      console.warn("Falling back to direct insert for work order activity", error);
    } catch (rpcErr) {
      console.warn("RPC error, falling back to direct insert:", rpcErr);
    }
    
    // Direct insert as fallback
    const { error } = await supabase
      .from('work_order_activities')
      .insert({
        action,
        work_order_id: workOrderId,
        user_id: userId,
        user_name: userName,
        flagged,
        flag_reason: flagReason
      });
      
    if (error) throw error;
    
    return { success: true };
  } catch (err) {
    console.error("Error recording work order activity:", err);
    return { 
      success: false, 
      error: err instanceof Error ? err.message : 'Unknown error recording activity'
    };
  }
};

export const flagWorkOrderActivity = async (
  activityId: string,
  flagReason: string
): Promise<{success: boolean; error?: string}> => {
  try {
    const { error } = await supabase
      .from('work_order_activities')
      .update({ 
        flagged: true,
        flag_reason: flagReason
      })
      .eq('id', activityId);
      
    if (error) throw error;
    
    return { success: true };
  } catch (err) {
    console.error("Error flagging work order activity:", err);
    return { 
      success: false, 
      error: err instanceof Error ? err.message : 'Unknown error flagging activity'
    };
  }
};
