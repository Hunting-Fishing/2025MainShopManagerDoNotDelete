
import { format, formatDistanceToNow } from "date-fns";
import { TeamMemberHistoryRecord } from "./types";

/**
 * Formats a history record for display
 * @param record The history record to format
 * @returns Formatted record with additional display properties
 */
export const formatHistoryRecord = (record: TeamMemberHistoryRecord) => {
  const date = new Date(record.timestamp);
  
  return {
    ...record,
    formattedDate: format(date, 'MMM d, yyyy h:mm a'),
    relativeDate: formatDistanceToNow(date, { addSuffix: true }),
    actionLabel: getActionLabel(record.action_type),
  };
};

/**
 * Gets a user-friendly label for an action type
 * @param actionType The action type code
 * @returns User-friendly label
 */
const getActionLabel = (actionType: string): string => {
  const actionLabels: Record<string, string> = {
    'role_assigned': 'Role assigned',
    'role_removed': 'Role removed',
    'department_changed': 'Department changed',
    'status_changed': 'Status changed',
    'created': 'Account created',
    'permission_added': 'Permission added',
    'permission_removed': 'Permission removed',
    // Add more action types as needed
  };

  return actionLabels[actionType] || actionType;
};
