
import { supabase } from '@/lib/supabase';

/**
 * Types for team member history records
 */
export interface TeamMemberHistoryRecord {
  id?: string;
  profile_id: string;
  action_type: 'creation' | 'update' | 'role_change' | 'deletion' | 'status_change';
  action_by: string;
  timestamp?: string;
  details: Record<string, any>;
}

/**
 * Records a history event for team member changes
 * @param record The history record to create
 * @returns Object with success status and message
 */
export const recordTeamMemberHistory = async (
  record: Omit<TeamMemberHistoryRecord, 'timestamp'>
): Promise<{success: boolean, message: string, id?: string}> => {
  try {
    // Get the current user ID to track who made the change
    const { data: { user } } = await supabase.auth.getUser();
    
    // Using a more generic approach to avoid type errors with table name
    const { data, error } = await supabase
      .from('team_member_history' as any)
      .insert({
        ...record,
        action_by: record.action_by || user?.id || 'system',
        timestamp: new Date().toISOString()
      })
      .select('id')
      .single();
      
    if (error) {
      console.error("Error recording team member history:", error);
      return {
        success: false,
        message: "Failed to record history"
      };
    }
    
    // Handle the possibility that data might be null or undefined
    // Using type assertion to avoid TypeScript errors
    const response = {
      success: true,
      message: "History recorded"
    };
    
    // Only add the id property if data exists and has an id
    if (data && typeof data === 'object' && data !== null && 'id' in data) {
      return {
        ...response,
        id: data.id as string
      };
    }
    
    return response;
  } catch (error) {
    console.error("Exception recording team member history:", error);
    return {
      success: false,
      message: "An error occurred while recording history"
    };
  }
};

/**
 * Fetch history records for a specific team member
 * @param profileId The ID of the team member
 * @returns Array of history records
 */
export const fetchTeamMemberHistory = async (profileId: string): Promise<TeamMemberHistoryRecord[]> => {
  try {
    const { data, error } = await supabase
      .from('team_member_history' as any)
      .select('*')
      .eq('profile_id', profileId)
      .order('timestamp', { ascending: false });
      
    if (error) {
      console.error("Error fetching team member history:", error);
      return [];
    }
    
    // If no data, return empty array
    if (!data || !Array.isArray(data)) {
      return [];
    }
    
    // Process the data to ensure it matches our expected type
    // Use type assertion after validation to assure TypeScript
    const processedData: TeamMemberHistoryRecord[] = data.map(item => {
      // Ensure item is an object with the properties we need
      if (typeof item !== 'object' || item === null) {
        // Return a default object if item is not valid
        return {
          profile_id: profileId,
          action_type: 'update',
          action_by: 'system',
          timestamp: new Date().toISOString(),
          details: {}
        };
      }
      
      return {
        id: item.id as string,
        profile_id: item.profile_id as string,
        // Make sure action_type is one of the allowed values
        action_type: validateActionType(item.action_type as string),
        action_by: item.action_by as string,
        timestamp: item.timestamp as string,
        details: (item.details as Record<string, any>) || {}
      };
    });
    
    return processedData;
  } catch (error) {
    console.error("Exception fetching team member history:", error);
    return [];
  }
};

/**
 * Validates that action_type is one of the allowed values
 */
function validateActionType(actionType: string): TeamMemberHistoryRecord['action_type'] {
  const validTypes: TeamMemberHistoryRecord['action_type'][] = [
    'creation', 'update', 'role_change', 'deletion', 'status_change'
  ];
  
  return validTypes.includes(actionType as any) 
    ? actionType as TeamMemberHistoryRecord['action_type'] 
    : 'update'; // Default to 'update' if invalid
}

/**
 * Formats a history record for display
 * @param record The history record to format
 * @returns A formatted string describing the change
 */
export const formatHistoryRecord = (record: TeamMemberHistoryRecord): string => {
  const timestamp = new Date(record.timestamp || new Date()).toLocaleString();
  
  switch(record.action_type) {
    case 'creation':
      return `Created on ${timestamp}`;
    case 'update':
      return `Profile updated on ${timestamp}${record.details.fields ? ` (${record.details.fields.join(', ')})` : ''}`;
    case 'role_change':
      return `Role changed from "${record.details.previous_role || 'None'}" to "${record.details.new_role}" on ${timestamp}`;
    case 'status_change':
      return `Status changed from "${record.details.previous_status || 'Active'}" to "${record.details.new_status}" on ${timestamp}`;
    case 'deletion':
      return `Team member removed on ${timestamp}`;
    default:
      return `Profile modified on ${timestamp}`;
  }
};
