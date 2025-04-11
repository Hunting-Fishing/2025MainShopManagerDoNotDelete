
import { TeamMemberHistoryRecord } from './types';

/**
 * Formats a history record for display
 */
export const formatHistoryRecord = (record: TeamMemberHistoryRecord): string => {
  try {
    switch (record.action_type) {
      case 'creation':
        return `Team member was created${record.action_by_name ? ' by ' + record.action_by_name : ''}.`;
      
      case 'update':
        if (record.details?.fields) {
          const fields = Array.isArray(record.details.fields) 
            ? record.details.fields.join(', ') 
            : record.details.fields;
          return `Profile updated: ${fields}${record.action_by_name ? ' by ' + record.action_by_name : ''}.`;
        }
        return `Profile was updated${record.action_by_name ? ' by ' + record.action_by_name : ''}.`;
      
      case 'role_change':
        const previousRole = record.details?.previous_role || record.details?.from || 'None';
        const newRole = record.details?.new_role || record.details?.to;
        return `Role changed from "${previousRole}" to "${newRole}"${record.action_by_name ? ' by ' + record.action_by_name : ''}.`;
      
      case 'status_change':
        return `Status changed from "${record.details?.previous_status || 'Active'}" to "${record.details?.new_status}"${record.action_by_name ? ' by ' + record.action_by_name : ''}.`;
      
      case 'deletion':
        return `Team member was removed${record.action_by_name ? ' by ' + record.action_by_name : ''}.`;
        
      default:
        return `${record.action_type.replace('_', ' ')} action performed${record.action_by_name ? ' by ' + record.action_by_name : ''}.`;
    }
  } catch (error) {
    console.error('Error formatting history record:', error);
    return 'Action details unavailable';
  }
};
