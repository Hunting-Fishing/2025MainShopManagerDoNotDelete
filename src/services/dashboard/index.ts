
// Re-export all dashboard service functions from the individual modules
export * from './statsService';
export * from './workOrderService';
export * from './checklistService';
export * from './technicianService';
export * from './equipmentService';
export * from './revenueService';

// Fix function name for getPhaseProgress
export { getPhaseProgress as getPhaseProgressData } from './workOrderService';
