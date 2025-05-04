
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

// Handle WorkOrder exports with explicit re-exports using 'export type'
export type { 
  WorkOrderStatusType,
  WorkOrderPriorityType,
  WorkOrderTemplate,
  TimeEntry,
  DbTimeEntry,
  WorkOrderInventoryItem,
  WorkOrder
} from './workOrder';

export { 
  statusMap,
  priorityMap
} from './workOrder';

// Add WorkOrderTypes namespace for backward compatibility
export namespace WorkOrderTypes {
  export type WorkOrder = import('./workOrder').WorkOrder;
  export type StatusType = import('./workOrder').WorkOrderStatusType;
  export type PriorityType = import('./workOrder').WorkOrderPriorityType;
}

// Handle Invoice exports with explicit re-exports
export type {
  Invoice,
  InvoiceItem,
  InvoiceStatus,
  InvoiceTemplate
} from './invoice';
