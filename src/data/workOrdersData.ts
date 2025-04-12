
/**
 * @deprecated This file is deprecated. 
 * Please import from '@/utils/workOrders' directory instead.
 * This file will be removed in a future version.
 */

import { 
  WorkOrder, 
  WorkOrderStatusType, 
  WorkOrderPriorityType, 
  TimeEntry, 
  WorkOrderInventoryItem 
} from '@/types/workOrder';

// Re-export the types for backward compatibility
export type { 
  WorkOrder, 
  WorkOrderStatusType, 
  WorkOrderPriorityType 
};

// Import and re-export all necessary functions from the new utility structure
import {
  findWorkOrderById,
  createWorkOrder,
  updateWorkOrder,
  getUniqueTechnicians,
  formatTimeInHoursAndMinutes,
  statusMap,
  priorityMap,
  determinePriority
} from '@/utils/workOrders';

export {
  findWorkOrderById,
  createWorkOrder,
  updateWorkOrder,
  getUniqueTechnicians,
  formatTimeInHoursAndMinutes,
  statusMap as WorkOrderStatus,
  priorityMap,
  determinePriority
};

// These are exported for backward compatibility
export const fetchWorkOrders = async (): Promise<WorkOrder[]> => {
  console.warn('fetchWorkOrders from workOrdersData.ts is deprecated. Use utilities from @/utils/workOrders instead.');
  // This is just a wrapper around other utilities
  return [];
};
