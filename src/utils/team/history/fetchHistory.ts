
import { supabase } from '@/lib/supabase';
import { TeamMemberHistoryRecord } from './types';

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
