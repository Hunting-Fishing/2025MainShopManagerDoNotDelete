
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
    // First record in technician_status_changes table
    const { data: statusChangeData, error: statusChangeError } = await supabase
      .from('technician_status_changes')
      .insert({
        technician_id: technicianId,
        previous_status: previousStatus,
        new_status: newStatus,
        change_reason: changeReason,
        changed_by: changedByUserId
      });

    if (statusChangeError) throw statusChangeError;

    // Also log this as a general activity for easier searching
    const { data: activityData, error: activityError } = await supabase
      .from('work_order_activities')
      .insert({
        work_order_id: '00000000-0000-0000-0000-000000000000', // No specific work order
        action: `Technician status changed: ${technicianName} from ${previousStatus} to ${newStatus}. Reason: ${changeReason}`,
        user_id: changedByUserId,
        user_name: changedByUserName
      });

    if (activityError) throw activityError;
    
    return statusChangeData;
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
    const { data, error } = await supabase
      .from('flagged_activities')
      .insert({
        technician_id: technicianId,
        activity_id: activityId,
        activity_type: activityType,
        flag_reason: flagReason,
        flagged_by: flaggedByUserId
      });

    if (error) throw error;
    
    // Also record this as a general activity
    const { error: activityError } = await supabase
      .from('work_order_activities')
      .insert({
        work_order_id: '00000000-0000-0000-0000-000000000000', // No specific work order
        action: `Activity flagged for technician ID ${technicianId}. Reason: ${flagReason}`,
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

// Get all flagged activities
export const getFlaggedActivities = async (resolved: boolean = false) => {
  try {
    const { data, error } = await supabase
      .from('flagged_activities')
      .select('*')
      .eq('resolved', resolved)
      .order('flagged_date', { ascending: false });
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching flagged activities:', error);
    throw error;
  }
};

// Resolve a flagged activity
export const resolveFlaggedActivity = async (
  flaggedActivityId: string,
  resolutionNotes: string,
  resolvedByUserId: string,
  resolvedByUserName: string
) => {
  try {
    const { data, error } = await supabase
      .from('flagged_activities')
      .update({
        resolved: true,
        resolved_date: new Date().toISOString(),
        resolved_by: resolvedByUserId,
        resolution_notes: resolutionNotes
      })
      .eq('id', flaggedActivityId);
      
    if (error) throw error;
    
    // Also record this as a general activity
    const { error: activityError } = await supabase
      .from('work_order_activities')
      .insert({
        work_order_id: '00000000-0000-0000-0000-000000000000', // No specific work order
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
