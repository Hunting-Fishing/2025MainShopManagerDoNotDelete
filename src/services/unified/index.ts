// Unified services for the new data persistence system
export { businessConstantsService, type BusinessConstant, type BusinessConstantsResponse } from './businessConstantsService';
export { unifiedSettingsService, type UnifiedSetting } from './unifiedSettingsService';
export { tempUuidService, type TempUuidRecord } from './tempUuidService';

// Utility functions for common operations
export const unifiedServices = {
  businessConstants: businessConstantsService,
  settings: unifiedSettingsService,
  tempUuid: tempUuidService
};