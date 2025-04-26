
/**
 * Export all functionality from the message module
 */

// Export all query functions
export * from './queries';

// Export all mutation functions 
export * from './mutations';

// Export all subscription functions
export * from './subscriptions';

// Export types from types.ts, but exclude saveMessageToRecord which we'll export from mutations
export type {
  MessageSendParams,
  MessageEditParams,
  MessageFlagParams,
  MessageQueryParams,
  ThreadMessagesParams,
} from './types';

// Export helper functions from types
export { 
  transformDatabaseMessage, 
  validateMessageType 
} from './types';

// Note: We removed the duplicate export of saveMessageToRecord
// The implementation is now in mutations.ts only
