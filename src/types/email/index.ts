
// Re-export all types from the email module files
export * from './common';
export * from './templates';
export * from './campaigns';
export * from './sequences';

// Explicitly re-export specific types to avoid conflicts
import { 
  EmailABTest as EmailABTestFromCampaigns,
  EmailABTestVariant as EmailABTestVariantFromCampaigns, 
  EmailABTestResult as EmailABTestResultFromCampaigns 
} from './campaigns';

// Export with different names to avoid conflicts
export type { EmailABTestFromCampaigns as EmailABTestExtended };
export type { EmailABTestVariantFromCampaigns as EmailABTestVariantExtended };
export type { EmailABTestResultFromCampaigns as EmailABTestResultExtended };
