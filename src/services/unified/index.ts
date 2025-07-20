// Unified services for the new data persistence system
import { businessConstantsService, type BusinessConstant, type BusinessConstantsResponse } from './businessConstantsService';

export { businessConstantsService, type BusinessConstant, type BusinessConstantsResponse };

// Utility functions for common operations
export const unifiedServices = {
  businessConstants: businessConstantsService
};