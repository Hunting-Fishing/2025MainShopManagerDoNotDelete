
// Re-export all types from the email module files
export * from './common';
export * from './templates';
export * from './campaigns';
export * from './sequences';
// Explicitly re-export ab-testing types without causing conflicts
import { EmailABTest as EmailABTestFromABTesting, EmailABTestVariant as EmailABTestVariantFromABTesting, EmailABTestResult as EmailABTestResultFromABTesting } from './ab-testing';

// Create type aliases that combine both definitions
export type { EmailABTestFromABTesting as EmailABTestExtended };
export type { EmailABTestVariantFromABTesting as EmailABTestVariantExtended };
export type { EmailABTestResultFromABTesting as EmailABTestResultExtended };
