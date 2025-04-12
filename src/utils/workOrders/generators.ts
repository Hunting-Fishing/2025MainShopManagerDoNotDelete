
import { WorkOrder } from "@/types/workOrder";

// Generate a unique work order ID
export const generateWorkOrderId = (): string => {
  const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, "");
  const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `WO-${dateStr}-${randomStr}`;
};
