
import { WorkOrder } from "@/types/workOrder";
import { supabase } from "@/lib/supabase";

export const updateWorkOrderPriority = async (
  workOrderId: string,
  newPriority: WorkOrder["priority"],
  userId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('work_orders')
      .update({ 
        priority: newPriority,
        updated_at: new Date().toISOString()
      })
      .eq('id', workOrderId);

    if (error) throw error;

    // Record the priority change activity
    await supabase.rpc('record_work_order_activity', {
      p_action: `Priority changed to ${newPriority}`,
      p_work_order_id: workOrderId,
      p_user_id: userId,
      p_user_name: 'System' // You might want to fetch the actual user name
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating work order priority:', error);
    return { 
      success: false, 
      error: 'Failed to update work order priority' 
    };
  }
};

export const getPriorityLevel = (priority: WorkOrder["priority"]): number => {
  switch (priority) {
    case "high":
      return 3;
    case "medium":
      return 2;
    case "low":
      return 1;
    default:
      return 0;
  }
};

export const sortByPriority = (a: WorkOrder, b: WorkOrder): number => {
  return getPriorityLevel(b.priority) - getPriorityLevel(a.priority);
};
