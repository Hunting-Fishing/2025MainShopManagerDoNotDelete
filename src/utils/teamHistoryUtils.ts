
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

// Fetch team member history records
export async function fetchTeamMemberHistory(profileId: string): Promise<TeamMemberHistoryRecord[]> {
  try {
    const { data, error } = await supabase
      .from('team_member_history')
      .select('*')
      .eq('profile_id', profileId)
      .order('timestamp', { ascending: false });
      
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching team member history:', error);
    return [];
  }
}

// Format history record for display
export function formatHistoryRecord(record: TeamMemberHistoryRecord): string {
  const date = new Date(record.timestamp).toLocaleDateString();
  const time = new Date(record.timestamp).toLocaleTimeString();
  
  let message = `${date} at ${time}`;
  
  if (record.action_by_name) {
    message += ` by ${record.action_by_name}`;
  }
  
  // Add specific details based on action type
  if (record.action_type === 'role_change') {
    const { from, to } = record.details || {};
    message += `: Role changed from ${from || 'None'} to ${to || 'None'}`;
  } else if (record.action_type === 'profile_update') {
    message += `: Profile information updated`;
  } else if (record.action_type === 'permission_change') {
    message += `: Permissions were modified`;
  } else if (record.action_type === 'account_created') {
    message += `: Account was created`;
  } else if (record.action_type === 'status_change') {
    const { from, to } = record.details || {};
    message += `: Status changed from ${from || 'Active'} to ${to || 'Inactive'}`;
  } else {
    // Generic message for other action types
    message += `: ${record.action_type.replace(/_/g, ' ')}`;
  }
  
  return message;
}
