
// This file now only contains utility functions that are not core CRUD operations
// Core CRUD operations have been moved to src/services/workOrder/

import { WorkOrder } from "@/types/workOrder";

// Re-export the WorkOrder type to ensure it's available where needed
export type { WorkOrder } from "@/types/workOrder";

// Note: Core CRUD operations (getWorkOrders, getWorkOrderById, createWorkOrder, etc.) 
// have been moved to src/services/workOrder/ for better organization.
// Import them from there instead.

// This file can be removed in a future cleanup as all functionality 
// has been moved to the service layer.
