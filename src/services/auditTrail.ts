
import { supabase } from "@/lib/supabase";

interface AuditLogEntry {
  action: string;
  resource: string;
  resource_id?: string;
  user_id?: string;
  details?: any;
  ip_address?: string;
}

// Track failed audit logs for potential retry
const failedAuditLogs: AuditLogEntry[] = [];

export const logUserAction = async (entry: AuditLogEntry): Promise<void> => {
  try {
    const { error } = await supabase
      .from("audit_logs")
      .insert(entry);
    
    if (error) throw error;
    
  } catch (err) {
    console.error("Failed to log user action:", err);
    // Store failed log attempt for potential retry
    failedAuditLogs.push(entry);
    
    // Alert the application about the audit failure (could be connected to a monitoring system)
    if (typeof window !== 'undefined') {
      console.warn('Audit logging failed - this should be reported to administrators');
    }
  }
};

// Function to retry failed audit logs
export const retryFailedAuditLogs = async (): Promise<void> => {
  if (failedAuditLogs.length === 0) return;
  
  // Take a snapshot of the current failed logs
  const logsToRetry = [...failedAuditLogs];
  
  // Clear the array before processing to avoid duplicates if new failures occur
  failedAuditLogs.length = 0;
  
  for (const entry of logsToRetry) {
    try {
      const { error } = await supabase
        .from("audit_logs")
        .insert(entry);
      
      if (error) throw error;
      
    } catch (err) {
      // If still failing, add back to the queue
      console.error("Retry failed for audit log:", err);
      failedAuditLogs.push(entry);
    }
  }
};

export const logCustomerEdit = async (
  customerId: string, 
  userId: string, 
  changes: any
): Promise<void> => {
  return logUserAction({
    action: "update",
    resource: "customer",
    resource_id: customerId,
    user_id: userId,
    details: {
      changes,
      timestamp: new Date().toISOString()
    }
  });
};
