
// Export types from individual type files, avoiding duplicates
// We'll use explicit exports to avoid ambiguity

// Export all types except the ones with potential conflicts
export * from './customer';
export * from './vehicle';
export * from './calendar';
export * from './interaction';
export * from './equipment';
export * from './notification';
export * from './team';
export * from './permissions';
export * from './reports';
export * from './chat';
export * from './repairPlan';
export * from './loyalty';
export * from './document';
export * from './feedback';
export * from './email';
export * from './form';
export * from './payment';

// Handle WorkOrder exports with explicit re-exports
import * as WorkOrderModule from './workOrder';
export {
  WorkOrderStatusType,
  WorkOrderPriorityType,
  WorkOrderTemplate,
  TimeEntry,
  DbTimeEntry,
  WorkOrderInventoryItem,
  statusMap,
  priorityMap
} from './workOrder';
// Re-export the WorkOrder interface explicitly to avoid conflict
export { WorkOrderModule as WorkOrderTypes };

// Handle Invoice exports with explicit re-exports
import * as InvoiceModule from './invoice';
// Re-export everything except potentially conflicting InventoryItem
export type {
  Invoice,
  InvoiceItem,
  InvoiceStatus,
  InvoiceTemplate
} from './inventory';
// Re-export the Invoice module explicitly to handle potential conflicts
export { InvoiceModule as InvoiceTypes };
