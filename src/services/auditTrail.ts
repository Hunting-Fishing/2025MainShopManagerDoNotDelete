
import { supabase } from "@/lib/supabase";

interface AuditLogEntry {
  action: string;
  resource: string;
  resource_id?: string;
  user_id?: string;
  details?: any;
  ip_address?: string;
}

export const logUserAction = async (entry: AuditLogEntry): Promise<void> => {
  try {
    const { error } = await supabase
      .from("audit_logs")
      .insert(entry);
    
    if (error) throw error;
    
  } catch (err) {
    console.error("Failed to log user action:", err);
    // We don't throw here to prevent blocking the main operation
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
