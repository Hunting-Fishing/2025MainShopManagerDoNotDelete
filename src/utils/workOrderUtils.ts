
// This file is now deprecated - importing from the new modular structure
// All exports are re-exported from src/utils/workOrders/index.ts

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
  getUniqueTechnicians,
  mapDatabaseToAppModel,
  mapTimeEntryFromDb,
  updateWorkOrder,
} = workOrderUtils;
