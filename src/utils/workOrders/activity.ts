
/**
 * Work order activity utilities
 */

/**
 * Format activity message
 */
export const formatActivityMessage = (action: string, details?: any): string => {
  switch (action) {
    case 'created':
      return 'Work order created';
    case 'updated':
      return 'Work order updated';
    case 'status_changed':
      return `Status changed to ${details?.newStatus || 'unknown'}`;
    case 'assigned':
      return `Assigned to ${details?.technician || 'technician'}`;
    case 'completed':
      return 'Work order completed';
    default:
      return action;
  }
};

/**
 * Get activity icon
 */
export const getActivityIcon = (action: string): string => {
  switch (action) {
    case 'created':
      return 'plus';
    case 'updated':
      return 'edit';
    case 'status_changed':
      return 'refresh';
    case 'assigned':
      return 'user';
    case 'completed':
      return 'check';
    default:
      return 'activity';
  }
};
