
import { supabase } from '@/lib/supabase';
import { RecordTeamMemberHistoryData, TeamMemberHistoryRecord } from './types';

/**
 * Records a history event for a team member
 */
export const recordTeamMemberHistory = async (
  data: RecordTeamMemberHistoryData
): Promise<TeamMemberHistoryRecord | null> => {
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
