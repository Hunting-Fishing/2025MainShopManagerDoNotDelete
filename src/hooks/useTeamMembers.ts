import { useState, useEffect, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { Profile } from '@/types/team';
import { Team } from '@/types/team';
import { useFetchProfiles } from './team/useFetchProfiles';
import { useFetchUserRoles } from './team/useFetchUserRoles';
import { supabase } from '@/integrations/supabase/client';

export interface UseTeamMembersReturn {
  teamMembers: Team[];
  loading: boolean;
  error: string | null;
  refreshTeamMembers: () => Promise<void>;
  addTeamMember: (profile: Profile) => Promise<void>;
  removeTeamMember: (profileId: string) => Promise<void>;
}

export const useTeamMembers = (): UseTeamMembersReturn => {
  const [teamMembers, setTeamMembers] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { profiles, loading: loadingProfiles, error: errorProfiles, fetchProfiles } = useFetchProfiles();
  const { userRoles, loading: loadingRoles, error: errorRoles, fetchUserRoles } = useFetchUserRoles();

  const loadTeamMembers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      await Promise.all([fetchProfiles(), fetchUserRoles()]);

      if (profiles && userRoles) {
        const members: Team[] = profiles.map((profile) => {
          const role = userRoles.find((userRole) => userRole.userId === profile.id);
          return {
            ...profile,
            role: role ? role.role : 'member', // Default to 'member' if no role is found
          };
        });
        setTeamMembers(members);
      }
    } catch (err: any) {
      console.error('Error loading team members:', err);
      setError(err.message || 'Failed to load team members');
      toast({
        title: "Error",
        description: "Failed to load team members",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [fetchProfiles, fetchUserRoles, profiles, userRoles, toast]);

  useEffect(() => {
    loadTeamMembers();
  }, [loadTeamMembers]);

  const refreshTeamMembers = useCallback(async () => {
    await loadTeamMembers();
  }, [loadTeamMembers]);

  const addTeamMember = async (profile: Profile) => {
    try {
      // Optimistically update the local state
      setTeamMembers((prevTeamMembers) => [...prevTeamMembers, { ...profile, role: 'member' }]);

      // Add a default role to the new team member in the database
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert([{ userId: profile.id, role: 'member' }]);

      if (roleError) {
        throw roleError;
      }

      toast({
        title: "Team member added",
        description: "Team member has been added successfully."
      });
    } catch (error: any) {
      console.error("Error adding team member:", error);
      toast({
        title: "Error",
        description: "Failed to add team member",
        variant: "destructive"
      });
    }
  };

  const removeTeamMember = async (profileId: string) => {
    try {
      // Optimistically update the local state
      setTeamMembers((prevTeamMembers) => prevTeamMembers.filter((member) => member.id !== profileId));

      // Remove the team member's role from the database
      const { error: roleError } = await supabase
        .from('user_roles')
        .delete()
        .eq('userId', profileId);

      if (roleError) {
        throw roleError;
      }

      toast({
        title: "Team member removed",
        description: "Team member has been removed successfully."
      });
    } catch (error: any) {
      console.error("Error removing team member:", error);
      toast({
        title: "Error",
        description: "Failed to remove team member",
        variant: "destructive"
      });
    }
  };

  return {
    teamMembers,
    loading,
    error,
    refreshTeamMembers,
    addTeamMember,
    removeTeamMember,
  };
};
