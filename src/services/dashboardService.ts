
// Re-export all dashboard service functions from the individual modules
export * from './dashboard/statsService';
export * from './dashboard/workOrderService';
export * from './dashboard/checklistService';
export * from './dashboard/technicianService';
export * from './dashboard/equipmentService';
export * from './dashboard/revenueService';

// Fix function name for getPhaseProgress
export { getPhaseProgress as getPhaseProgressData } from './dashboard/workOrderService';
