
import { WorkOrderInventoryItem } from "@/types/workOrder";

// Additional fields needed by UI components that extend the base type
export interface ExtendedWorkOrderInventoryItem extends WorkOrderInventoryItem {
  notes?: string;
  itemStatus?: string;
  estimatedArrivalDate?: string;
  supplierName?: string;
  supplierOrderRef?: string;
  unitPrice?: number; // Alias for unit_price
}

// Re-export the type for components that need it
export type { WorkOrderInventoryItem };
