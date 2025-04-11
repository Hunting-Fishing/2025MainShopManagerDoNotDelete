
import { getMessageType, transformDatabaseMessage, parseTaggedItems, MessageSendParams, MessageEditParams, MessageFlagParams } from './messageTypes';
import { parseTaggedItems as parseTagsHelper } from './messageHelpers';

// Re-export all types and functions
export {
  getMessageType,
  transformDatabaseMessage,
  parseTaggedItems,
  MessageSendParams,
  MessageEditParams,
  MessageFlagParams
};

// For compatibility, ensure parseTaggedItems is correctly exported
export { parseTagsHelper as parseTaggedItems };
