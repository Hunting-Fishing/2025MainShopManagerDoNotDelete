
import { supabase } from '@/integrations/supabase/client';

export async function recordWorkOrderActivity(activityData: {
  work_order_id: string;
  action: string;
  user_id: string;
  user_name: string;
}): Promise<void> {
  try {
    const { error } = await supabase
      .from('work_order_activities')
      .insert(activityData);

    if (error) throw error;
  } catch (error) {
    console.error('Error recording work order activity:', error);
    throw error;
  }
}

export async function getWorkOrderActivities(workOrderId: string): Promise<any[]> {
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
    throw error;
  }
}

export async function flagWorkOrderActivity(activityId: string, flagReason: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('work_order_activities')
      .update({ 
        flagged: true, 
        flag_reason: flagReason 
      })
      .eq('id', activityId);

    if (error) throw error;
  } catch (error) {
    console.error('Error flagging work order activity:', error);
    throw error;
  }
}
