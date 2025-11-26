
import { useState, useEffect, useCallback } from 'react';
import { TeamMember } from "@/types/team";
import { useFetchProfiles } from './team/useFetchProfiles';
import { useFetchUserRoles } from './team/useFetchUserRoles';
import { useTeamDataTransformer } from './team/useTeamDataTransformer';
import { supabase } from '@/lib/supabase';
import { getAllWorkOrders } from '@/services/workOrder';
import { generateUniqueDisplayNames, formatDisplayName } from '@/utils/duplicateNameHandler';

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
  const { transformData } = useTeamDataTransformer();

  // Fetch work orders directly
  const fetchWorkOrders = async () => {
    try {
      return await getAllWorkOrders();
    } catch (error) {
      console.error('Error fetching work orders:', error);
      return [];
    }
  };

  const fetchTeamMembers = async () => {
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
        
        // Generate unique display names for duplicate detection
        const displayNameMap = generateUniqueDisplayNames(profiles);
        
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
                
                // Safely cast the details JSON to our interface using a two-step process
                // First cast to unknown, then to our interface type
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
                
                // Get unique display name
                const displayInfo = displayNameMap.get(member.id);
                const displayName = displayInfo ? formatDisplayName(displayInfo) : `${member.first_name} ${member.last_name}`;
                
                // Transform to proper TeamMember format
                return {
                  id: member.id,
                  name: displayName,
                  email: member.email,
                  phone: member.phone,
                  role: member.job_title || 'Team Member',
                  jobTitle: member.job_title || '',
                  department: member.department || '',
                  status: validStatus,
                  workOrders: {
                    assigned: member.activeWorkOrders || 0,
                    completed: 0 // We'll need to calculate this if needed
                  },
                  statusChangeDate: latestStatusChange.timestamp,
                  statusChangeReason: details.reason || ''
                } as TeamMember;
              }
            } catch (err) {
              console.error('Error fetching status for member:', member.id, err);
            }
            
            // Get unique display name for default case
            const displayInfo = displayNameMap.get(member.id);
            const displayName = displayInfo ? formatDisplayName(displayInfo) : `${member.first_name} ${member.last_name}`;
            
            // Default transformation for members without status history
            return {
              id: member.id,
              name: displayName,
              email: member.email,
              phone: member.phone,
              role: member.job_title || 'Team Member',
              jobTitle: member.job_title || '',
              department: member.department || '',
              status: 'Active' as const,
              workOrders: {
                assigned: member.activeWorkOrders || 0,
                completed: 0 // We'll need to calculate this if needed
              }
            } as TeamMember;
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
    };

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  // Helper function to validate that status is one of the allowed values in TeamMember type
  function validateStatus(status: string): TeamMember['status'] {
    const validStatuses: TeamMember['status'][] = ['Active', 'Inactive', 'On Leave', 'Terminated'];
    return validStatuses.includes(status as TeamMember['status']) 
      ? (status as TeamMember['status']) 
      : 'Active';
  }

  const refetch = useCallback(() => {
    setIsLoading(true);
    fetchTeamMembers();
  }, []);

  return { teamMembers, isLoading, error, refetch };
}
