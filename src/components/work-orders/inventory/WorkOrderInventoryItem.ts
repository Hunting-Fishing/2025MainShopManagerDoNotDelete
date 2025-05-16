
import { WorkOrderInventoryItem as BaseWorkOrderInventoryItem } from "@/types/workOrder";

// Additional fields needed by UI components that extend the base type
export interface ExtendedWorkOrderInventoryItem extends BaseWorkOrderInventoryItem {
  notes?: string;
  itemStatus?: string;
  estimatedArrivalDate?: string;
  supplierName?: string;
  supplierOrderRef?: string;
  unitPrice?: number; // Alias for unit_price
  total: number;     // Making sure this is required as it's used in components
}

// Re-export the type for components that need it
export type { BaseWorkOrderInventoryItem as WorkOrderInventoryItem };
