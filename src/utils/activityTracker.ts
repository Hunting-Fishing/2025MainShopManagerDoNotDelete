
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { recordWorkOrderActivity } from "@/utils/workOrderUtils";

// Types of trackable activities
export type ActivityType = "login" | "workOrder" | "invoice";

// Structure for an activity record
export interface ActivityRecord {
  id: string;
  type: ActivityType;
  description: string;
  date: string;
  staffId: string;
  staffName: string;
  relatedId?: string; // Work order ID, invoice ID, etc.
}

// Function to record staff activity
export const recordActivity = async (
  type: ActivityType,
  description: string,
  staffId: string,
  staffName: string,
  relatedId?: string
): Promise<ActivityRecord | null> => {
  try {
    // In a real app with a more complete Supabase setup,
    // we would insert into a general activity log table here
    
    // For now, we'll just log to console and return a mock record
    console.log("Activity recorded:", {
      type,
      description,
      staffId,
      staffName,
      relatedId
    });
    
    return {
      id: crypto.randomUUID(),
      type,
      description,
      date: new Date().toISOString(),
      staffId,
      staffName,
      relatedId
    };
  } catch (error) {
    console.error("Error recording activity:", error);
    return null;
  }
};

// We've moved recordWorkOrderActivity to workOrderUtils.ts
// to avoid circular dependencies, so let's re-export it here for compatibility
export { recordWorkOrderActivity };

// Function to record invoice activity specifically
export const recordInvoiceActivity = async (
  action: string,
  invoiceId: string,
  staffId: string,
  staffName: string,
  showToast: boolean = true
): Promise<ActivityRecord | null> => {
  const description = `${action} invoice ${invoiceId}`;
  
  if (showToast) {
    toast({
      title: "Activity Recorded",
      description: description,
      variant: "success",
    });
  }
  
  return recordActivity("invoice", description, staffId, staffName, invoiceId);
};
