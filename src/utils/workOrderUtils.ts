
/**
 * @deprecated This file is deprecated. 
 * Please import from '@/utils/workOrders' directory instead.
 * This file will be removed in a future version.
 */

// Re-export everything from the new modular structure
import * as workOrderUtils from './workOrders';
export default workOrderUtils;

// For backward compatibility, re-export all of the individual functions
export const {
  createWorkOrder,
  deleteWorkOrder,
  findWorkOrderById,
  formatDate,
  formatTimeInHoursAndMinutes,
  generateWorkOrderId,
  mapDatabaseToAppModel,
  mapTimeEntryFromDb,
  updateWorkOrder,
  getUniqueTechnicians,
  statusMap,
  WorkOrderStatus,
  priorityMap,
  determinePriority
} = workOrderUtils;
