
import { supabase } from '@/integrations/supabase/client';

// Record work order activity
export const recordWorkOrderActivity = async (
  action: string,
  workOrderId: string,
  userId: string,
  userName: string,
  flagged: boolean = false,
  flagReason?: string
) => {
  try {
    const { data, error } = await supabase
      .from('work_order_activities')
      .insert([
        {
          work_order_id: workOrderId,
          action: action,
          user_id: userId,
          user_name: userName,
          flagged: flagged,
          flag_reason: flagReason
        }
      ]);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error recording work order activity:', error);
    throw error;
  }
};

// Record invoice activity - We'll adapt this to use the work_order_activities table
export const recordInvoiceActivity = async (
  action: string,
  invoiceId: string,
  userId: string,
  userName: string,
  flagged: boolean = false,
  flagReason?: string
) => {
  try {
    // Check if the invoiceId is a work order ID format, if not, use a fallback empty ID
    // We'll store the invoice information in the action text
    const workOrderId = invoiceId.startsWith('WO-') ? invoiceId : '00000000-0000-0000-0000-000000000000';
    
    const { data, error } = await supabase
      .from('work_order_activities')
      .insert([
        {
          work_order_id: workOrderId,
          action: `Invoice ${invoiceId}: ${action}`,
          user_id: userId,
          user_name: userName,
          flagged: flagged,
          flag_reason: flagReason
        }
      ]);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error recording invoice activity:', error);
    throw error;
  }
};
