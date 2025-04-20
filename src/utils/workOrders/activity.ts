
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
