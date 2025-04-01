
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

// Record SMS communication activity
export const recordSmsActivity = async (
  workOrderId: string,
  phoneNumber: string,
  message: string,
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
          action: `SMS sent to ${phoneNumber}`,
          user_id: userId,
          user_name: userName,
          flagged: flagged,
          flag_reason: flagReason
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
          action: `${callType} call initiated to ${phoneNumber}`,
          user_id: userId,
          user_name: userName,
          flagged: flagged,
          flag_reason: flagReason
        }
      ]);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error recording call activity:', error);
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

// Record technician status change
export const recordTechnicianStatusChange = async (
  technicianId: string,
  technicianName: string,
  previousStatus: string,
  newStatus: string,
  changeReason: string,
  changedByUserId: string,
  changedByUserName: string
) => {
  try {
    // Record in work_order_activities since we can't directly access technician_status_changes
    const { data: activityData, error: activityError } = await supabase
      .from('work_order_activities')
      .insert({
        work_order_id: '00000000-0000-0000-0000-000000000000', // No specific work order
        action: `Technician status changed: ${technicianName} from ${previousStatus} to ${newStatus}. Reason: ${changeReason}`,
        user_id: changedByUserId,
        user_name: changedByUserName
      });

    if (activityError) throw activityError;
    
    return activityData;
  } catch (error) {
    console.error('Error recording technician status change:', error);
    throw error;
  }
};

// Record flagged activity
export const recordFlaggedActivity = async (
  technicianId: string,
  activityId: string,
  activityType: string,
  flagReason: string,
  flaggedByUserId: string,
  flaggedByUserName: string
) => {
  try {
    // Record this as a general activity in work_order_activities
    const { data, error: activityError } = await supabase
      .from('work_order_activities')
      .insert({
        work_order_id: '00000000-0000-0000-0000-000000000000', // No specific work order
        action: `Activity flagged for technician ID ${technicianId}, activity ID ${activityId}, type ${activityType}. Reason: ${flagReason}`,
        user_id: flaggedByUserId,
        user_name: flaggedByUserName,
        flagged: true,
        flag_reason: flagReason
      });

    if (activityError) throw activityError;
    
    return data;
  } catch (error) {
    console.error('Error recording flagged activity:', error);
    throw error;
  }
};

// Get all activity for a specific technician
export const getTechnicianActivity = async (technicianId: string) => {
  try {
    const { data, error } = await supabase
      .from('work_order_activities')
      .select('*')
      .eq('user_id', technicianId)
      .order('timestamp', { ascending: false });
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching technician activity:', error);
    throw error;
  }
};

// Get all flagged activities (Using work_order_activities table with flagged=true)
export const getFlaggedActivities = async (resolved: boolean = false) => {
  try {
    const { data, error } = await supabase
      .from('work_order_activities')
      .select('*')
      .eq('flagged', true)
      .order('timestamp', { ascending: false });
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching flagged activities:', error);
    throw error;
  }
};

// Resolve a flagged activity (Updated to use work_order_activities)
export const resolveFlaggedActivity = async (
  flaggedActivityId: string,
  resolutionNotes: string,
  resolvedByUserId: string,
  resolvedByUserName: string
) => {
  try {
    // First, find the flagged activity to mark as resolved
    const { data: activityToResolve, error: findError } = await supabase
      .from('work_order_activities')
      .select('*')
      .eq('id', flaggedActivityId)
      .single();
    
    if (findError) throw findError;
    
    // Create a new activity to record the resolution
    const { data, error: activityError } = await supabase
      .from('work_order_activities')
      .insert({
        work_order_id: activityToResolve.work_order_id || '00000000-0000-0000-0000-000000000000',
        action: `Resolved flagged activity ID ${flaggedActivityId}. Notes: ${resolutionNotes}`,
        user_id: resolvedByUserId,
        user_name: resolvedByUserName
      });

    if (activityError) throw activityError;
    
    return data;
  } catch (error) {
    console.error('Error resolving flagged activity:', error);
    throw error;
  }
};
