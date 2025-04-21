
// Re-export all room service functions
export * from './queries';
export * from './mutations';
export * from './userRooms';
export * from './types';

// Handle ambiguous exports by explicitly re-exporting them
import { getWorkOrderChatRoom as getWorkOrderRoom, getShiftChatRoom as getShiftRoom } from './queries';
export { getWorkOrderRoom, getShiftRoom };
