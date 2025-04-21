
/**
 * Strip down exports:
 * - Export types, interfaces from './types' explicitly excluding the saveMessageToRecord function.
 * - Export mutations fully including saveMessageToRecord implementation.
 * - Export queries normally.
 * - Export saveMessageToRecord from types with alias to avoid conflict.
 */

// Export types and interfaces explicitly (except saveMessageToRecord)
export * from './queries';
export * from './mutations';

// Explicitly export only types (interfaces and helper functions) from types file excluding saveMessageToRecord
export type {
  MessageSendParams,
  MessageEditParams,
  MessageFlagParams,
  MessageQueryParams,
  ThreadMessagesParams,
} from './types';

export { 
  transformDatabaseMessage, 
  validateMessageType 
} from './types';

// Export saveMessageToRecord util under alias to avoid conflict with mutation export
export { saveMessageToRecord as saveMessageToRecordUtil } from './types';

