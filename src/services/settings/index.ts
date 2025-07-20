
// Centralized settings services export
export { companyService } from './companyService';
export { workOrderSettingsService } from './workOrderSettingsService';

// Re-export types for convenience
export type { CompanyInfo, BusinessHours } from './companyService';
export type { WorkOrderOption, WorkOrderDefaults } from './workOrderSettingsService';

// Unified settings services
export const settingsServices = {
  company: () => import('./companyService').then(m => m.companyService),
  workOrder: () => import('./workOrderSettingsService').then(m => m.workOrderSettingsService),
};
