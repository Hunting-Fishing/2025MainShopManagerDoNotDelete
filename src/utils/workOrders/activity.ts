
import { supabase } from "@/integrations/supabase/client";

// Record work order activity for audit trail
export async function recordWorkOrderActivity(
  action: string,
  workOrderId: string,
  userId: string,
  userName: string,
  details?: Record<string, any>
): Promise<boolean> {
  try {
    const { error } = await supabase.from('work_order_activities').insert([
      {
        work_order_id: workOrderId,
        action,
        user_id: userId,
        user_name: userName,
        details
      }
    ]);

    if (error) {
      console.error("Error recording work order activity:", error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Error in recordWorkOrderActivity:", err);
    return false;
  }
}

// Get work order activity history
export async function getWorkOrderActivity(workOrderId: string) {
  try {
    const { data, error } = await supabase
      .from('work_order_activities')
      .select('*')
      .eq('work_order_id', workOrderId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching work order activity:", error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("Error in getWorkOrderActivity:", err);
    return [];
  }
}

// Add an alias that matches what components are expecting
export const getWorkOrderActivities = getWorkOrderActivity;

// Flag a work order activity for review
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

    if (error) {
      console.error("Error flagging work order activity:", error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Error in flagWorkOrderActivity:", err);
    return false;
  }
}

// Unflag a work order activity
export async function unflagWorkOrderActivity(activityId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('work_order_activities')
      .update({ 
        flagged: false,
        flag_reason: null 
      })
      .eq('id', activityId);

    if (error) {
      console.error("Error unflagging work order activity:", error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Error in unflagWorkOrderActivity:", err);
    return false;
  }
}

// Get flagged activities
export async function getFlaggedActivities() {
  try {
    const { data, error } = await supabase
      .from('work_order_activities')
      .select('*, work_orders!inner(*)')
      .eq('flagged', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching flagged activities:", error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("Error in getFlaggedActivities:", err);
    return [];
  }
}
