
// Re-export all message service functions
export * from './queries';
export * from './mutations';
export * from './types';

// Handle ambiguous exports by explicitly re-exporting
export { saveMessageToRecord as saveMessageToRecordUtil } from './types';
