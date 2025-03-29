
import { toast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";

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
export const recordActivity = (
  type: ActivityType,
  description: string,
  staffId: string,
  staffName: string,
  relatedId?: string
): ActivityRecord => {
  const activity: ActivityRecord = {
    id: uuidv4(),
    type,
    description,
    date: new Date().toISOString(),
    staffId,
    staffName,
    relatedId
  };

  // In a real app, this would be sent to the server
  // For now, we'll log it to the console
  console.log("Activity recorded:", activity);
  
  return activity;
};

// Function to record work order activity specifically
export const recordWorkOrderActivity = (
  action: string,
  workOrderId: string,
  staffId: string,
  staffName: string,
  showToast: boolean = true
): ActivityRecord => {
  const description = `${action} work order ${workOrderId}`;
  
  if (showToast) {
    toast({
      title: "Activity Recorded",
      description: description,
      variant: "success",
    });
  }
  
  return recordActivity("workOrder", description, staffId, staffName, workOrderId);
};

// Function to record invoice activity specifically
export const recordInvoiceActivity = (
  action: string,
  invoiceId: string,
  staffId: string,
  staffName: string,
  showToast: boolean = true
): ActivityRecord => {
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
