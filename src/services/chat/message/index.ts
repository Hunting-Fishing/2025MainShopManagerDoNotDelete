
// Re-export all message service functions
export * from './queries';
export * from './mutations';
export * from './types';

// Handle ambiguous exports
export { saveMessageToRecord } from './types';
