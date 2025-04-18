
import { useState, useEffect } from 'react';
import { TeamMember } from "@/types/team";
import { useFetchProfiles } from './team/useFetchProfiles';
import { useFetchUserRoles } from './team/useFetchUserRoles';
import { useFetchWorkOrders } from './team/useFetchWorkOrders';
import { useTeamDataTransformer } from './team/useTeamDataTransformer';
import { supabase } from '@/lib/supabase';

/**
 * Interface for the status change details from team_member_history
 */
interface StatusChangeDetails {
  new_status: string;
  previous_status?: string;
  reason?: string;
}

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
          fetchProfiles().catch(err => {
            console.error("Error fetching profiles:", err);
            return [];
          }),
          fetchUserRoles().catch(err => {
            console.error("Error fetching user roles:", err);
            return [];
          }),
          fetchWorkOrders().catch(err => {
            console.error("Error fetching work orders:", err);
            return [];
          })
        ]);

        console.log("Fetched profiles:", profiles.length);
        console.log("Fetched roles:", userRoles.length);
        
        // If we have no profiles, initialize with empty array but don't treat as error
        if (profiles.length === 0) {
          console.log("No team members found - returning empty array");
          setTeamMembers([]);
          setIsLoading(false);
          return;
        }

        // Transform the raw data into TeamMember objects
        const mappedMembers = transformData(profiles, userRoles, workOrderData);
        
        // Attempt to fetch status data, but continue even if it fails
        try {
          // Check if team_member_history table exists
          const { data: tableExists } = await supabase
            .rpc('check_if_table_exists', { table_name: 'team_member_history' });
            
          if (!tableExists) {
            // Table doesn't exist, skip this step
            console.log("team_member_history table doesn't exist, skipping status fetch");
            setTeamMembers(mappedMembers.map(member => ({
              ...member,
              status: 'Active' as const
            })));
            return;
          }
            
          // Fetch status changes if table exists
          const membersWithStatus = await Promise.all(
            mappedMembers.map(async (member) => {
              try {
                // Get latest status change record for this member
                const { data: statusData, error: statusError } = await supabase
                  .from('team_member_history')
                  .select('*')
                  .eq('profile_id', member.id)
                  .eq('action_type', 'status_change')
                  .order('timestamp', { ascending: false })
                  .limit(1);
                  
                if (statusError || !statusData || statusData.length === 0) {
                  return {
                    ...member,
                    status: 'Active' as const
                  };
                }
                  
                const latestStatusChange = statusData[0];
                
                // Safely cast the details JSON to our interface using a two-step process
                const rawDetails = latestStatusChange.details;
                let details: StatusChangeDetails;
                
                // Handle different possible formats of the details field
                if (typeof rawDetails === 'object' && rawDetails !== null) {
                  details = rawDetails as unknown as StatusChangeDetails;
                } else {
                  // Fallback if details is not in the expected format
                  details = { new_status: 'Active' };
                }
                
                // Validate that the status is one of the allowed TeamMember status values
                const statusValue = details.new_status || 'Active';
                const validStatus = validateStatus(statusValue);
                
                return {
                  ...member,
                  status: validStatus,
                  statusChangeDate: latestStatusChange.timestamp,
                  statusChangeReason: details.reason || ''
                };
              } catch (err) {
                console.error('Error fetching status for member:', member.id, err);
                return {
                  ...member,
                  status: 'Active' as const
                };
              }
            })
          );
          
          setTeamMembers(membersWithStatus as TeamMember[]);
        } catch (statusErr) {
          // If status fetch fails, still show members with default status
          console.error('Error fetching statuses:', statusErr);
          setTeamMembers(mappedMembers.map(member => ({
            ...member,
            status: 'Active' as const
          })));
        }
      } catch (err: any) {
        console.error('Error in useTeamMembers:', err);
        setError(err?.message || 'Failed to load team members. Please try again later.');
        // Even on error, set empty array to avoid infinite loading
        setTeamMembers([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchTeamMembers();
  }, []);

  // Helper function to validate that status is one of the allowed values in TeamMember type
  function validateStatus(status: string): TeamMember['status'] {
    const validStatuses: TeamMember['status'][] = ['Active', 'Inactive', 'On Leave', 'Terminated'];
    return validStatuses.includes(status as TeamMember['status']) 
      ? (status as TeamMember['status']) 
      : 'Active';
  }

  return { teamMembers, isLoading, error };
}
