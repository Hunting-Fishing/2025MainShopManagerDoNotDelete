
// Centralized settings services export
export { companyService } from './companyService';
export { workOrderSettingsService } from './workOrderSettingsService';
export { loyaltySettingsService } from './loyaltySettingsService';

// Re-export types for convenience
export type { CompanyInfo, BusinessHours } from './companyService';
export type { WorkOrderOption, WorkOrderDefaults } from './workOrderSettingsService';
export type { LoyaltyConfiguration } from './loyaltySettingsService';

// Unified settings services
export const settingsServices = {
  company: () => import('./companyService').then(m => m.companyService),
  workOrder: () => import('./workOrderSettingsService').then(m => m.workOrderSettingsService),
  loyalty: () => import('./loyaltySettingsService').then(m => m.loyaltySettingsService),
};
