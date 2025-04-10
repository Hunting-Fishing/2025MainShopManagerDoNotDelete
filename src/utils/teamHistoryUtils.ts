
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
    return {
      success: true,
      message: "History recorded",
      id: data?.id as string | undefined
    };
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
    // Define a type that matches the expected result structure
    type HistoryRecord = {
      id: string;
      profile_id: string;
      action_type: string;
      action_by: string;
      timestamp: string;
      details: Record<string, any>;
    };

    const { data, error } = await supabase
      .from('team_member_history' as any)
      .select('*')
      .eq('profile_id', profileId)
      .order('timestamp', { ascending: false });
      
    if (error) {
      console.error("Error fetching team member history:", error);
      return [];
    }
    
    // Convert the generic data to our expected type and handle null case
    return (data || []) as HistoryRecord[];
  } catch (error) {
    console.error("Exception fetching team member history:", error);
    return [];
  }
};

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
