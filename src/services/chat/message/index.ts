
// Re-export all message service functions
export * from './queries';
export * from './mutations';
export * from './types';

// Handle ambiguous exports by explicitly re-exporting them
import { saveMessageToRecord as saveMsgToRecord } from './mutations';
export { saveMsgToRecord };
