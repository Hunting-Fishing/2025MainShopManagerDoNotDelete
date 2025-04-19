
// Re-export everything from the new modular structure
import * as workOrderUtils from './workOrders';
export default workOrderUtils;

// For backward compatibility, re-export all of the individual functions
export const {
  createWorkOrder,
  deleteWorkOrder,
  findWorkOrderById,
  formatDate,
  formatTimeInHoursAndMinutes,  // Add this back
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
