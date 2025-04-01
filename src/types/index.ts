
// Export all types from the individual type files
export * from './customer';
export * from './invoice'; // Make sure this comes before conflicting types
// Re-export from inventory but exclude items that would conflict with invoice exports
export type { InventoryItem } from './inventory';
// Re-export from vehicle
export * from './vehicle';
// Re-export from workOrder but exclude items that would conflict with invoice exports
export type { WorkOrder as WorkOrderMain } from './workOrder';
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
