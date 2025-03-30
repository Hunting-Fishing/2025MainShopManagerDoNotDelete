
import { supabase } from '@/integrations/supabase/client';

// Record work order activity
export const recordWorkOrderActivity = async (
  action: string,
  workOrderId: string,
  userId: string,
  userName: string
) => {
  try {
    const { data, error } = await supabase
      .from('work_order_activities')
      .insert([
        {
          work_order_id: workOrderId,
          action: action,
          user_id: userId,
          user_name: userName
        }
      ]);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error recording work order activity:', error);
    throw error;
  }
};

// Record SMS communication activity
export const recordSmsActivity = async (
  workOrderId: string,
  phoneNumber: string,
  message: string,
  userId: string,
  userName: string
) => {
  try {
    const { data, error } = await supabase
      .from('work_order_activities')
      .insert([
        {
          work_order_id: workOrderId,
          action: `SMS sent to ${phoneNumber}`,
          user_id: userId,
          user_name: userName
        }
      ]);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error recording SMS activity:', error);
    throw error;
  }
};

// Record call activity
export const recordCallActivity = async (
  workOrderId: string,
  phoneNumber: string,
  callType: string,
  userId: string,
  userName: string
) => {
  try {
    const { data, error } = await supabase
      .from('work_order_activities')
      .insert([
        {
          work_order_id: workOrderId,
          action: `${callType} call initiated to ${phoneNumber}`,
          user_id: userId,
          user_name: userName
        }
      ]);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error recording call activity:', error);
    throw error;
  }
};
