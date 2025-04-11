
import { supabase } from '@/lib/supabase';

export interface TeamMemberHistoryRecord {
  id: string;
  profile_id: string;
  action_type: string;
  action_by: string;
  action_by_name?: string;
  timestamp: string;
  details: any;
}

/**
 * Records a history event for a team member
 */
export const recordTeamMemberHistory = async (data: {
  profile_id: string;
  action_type: string;
  action_by: string;
  action_by_name?: string;
  details: any;
}): Promise<TeamMemberHistoryRecord | null> => {
  try {
    const { data: historyRecord, error } = await supabase
      .from('team_member_history')
      .insert({
        profile_id: data.profile_id,
        action_type: data.action_type,
        action_by: data.action_by,
        action_by_name: data.action_by_name,
        details: data.details
      })
      .select()
      .single();
      
    if (error) {
      console.error("Error recording team member history:", error);
      return null;
    }
    
    return historyRecord;
  } catch (err) {
    console.error("Exception recording team member history:", err);
    return null;
  }
};

/**
 * Fetches history records for a specific team member
 */
export const fetchTeamMemberHistory = async (profileId: string): Promise<TeamMemberHistoryRecord[]> => {
  try {
    const { data, error } = await supabase
      .from('team_member_history')
      .select('*')
      .eq('profile_id', profileId)
      .order('timestamp', { ascending: false });
      
    if (error) {
      console.error("Error fetching team member history:", error);
      return [];
    }
    
    return data || [];
  } catch (err) {
    console.error("Exception fetching team member history:", err);
    return [];
  }
};

/**
 * Fetches all team history records
 */
export const fetchAllTeamHistory = async (): Promise<TeamMemberHistoryRecord[]> => {
  try {
    const { data, error } = await supabase
      .from('team_member_history')
      .select('*')
      .order('timestamp', { ascending: false });
      
    if (error) {
      console.error("Error fetching all team history:", error);
      return [];
    }
    
    return data || [];
  } catch (err) {
    console.error("Exception fetching all team history:", err);
    return [];
  }
};

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
        return `Role changed from "${record.details?.previous_role || 'None'}" to "${record.details?.new_role}"${record.action_by_name ? ' by ' + record.action_by_name : ''}.`;
      
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
