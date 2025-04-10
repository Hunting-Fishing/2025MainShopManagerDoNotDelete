
import { useState, useEffect } from 'react';
import { TeamMember } from "@/types/team";
import { useFetchProfiles } from './team/useFetchProfiles';
import { useFetchUserRoles } from './team/useFetchUserRoles';
import { useFetchWorkOrders } from './team/useFetchWorkOrders';
import { useTeamDataTransformer } from './team/useTeamDataTransformer';
import { supabase } from '@/lib/supabase';

/**
 * Hook for fetching and combining team member data
 */
export function useTeamMembers() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Import the specialized hooks
  const { fetchProfiles } = useFetchProfiles();
  const { fetchUserRoles } = useFetchUserRoles();
  const { fetchWorkOrders } = useFetchWorkOrders();
  const { transformData } = useTeamDataTransformer();

  useEffect(() => {
    async function fetchTeamMembers() {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch all required data in parallel for better performance
        const [profiles, userRoles, workOrderData] = await Promise.all([
          fetchProfiles(),
          fetchUserRoles(),
          fetchWorkOrders()
        ]);

        if (profiles.length === 0) {
          setTeamMembers([]);
          return;
        }

        // Transform the raw data into TeamMember objects
        const mappedMembers = transformData(profiles, userRoles, workOrderData);
        
        // Fetch additional status information from team_member_history
        const membersWithStatus = await Promise.all(
          mappedMembers.map(async (member) => {
            try {
              // Get latest status change record for this member
              const { data: statusData } = await supabase
                .from('team_member_history')
                .select('*')
                .eq('profile_id', member.id)
                .eq('action_type', 'status_change')
                .order('timestamp', { ascending: false })
                .limit(1);
                
              if (statusData && statusData.length > 0) {
                const latestStatusChange = statusData[0];
                return {
                  ...member,
                  status: latestStatusChange.details.new_status || 'Active',
                  statusChangeDate: latestStatusChange.timestamp,
                  statusChangeReason: latestStatusChange.details.reason || ''
                };
              }
            } catch (err) {
              console.error('Error fetching status for member:', member.id, err);
            }
            return member;
          })
        );
        
        setTeamMembers(membersWithStatus);
      } catch (err: any) {
        console.error('Error fetching team members:', err);
        setError(err?.message || 'Failed to load team members. Please try again later.');
        setTeamMembers([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchTeamMembers();
  }, []);

  return { teamMembers, isLoading, error };
}
