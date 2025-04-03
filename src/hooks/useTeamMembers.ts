
import { useState, useEffect } from 'react';
import { TeamMember } from "@/types/team";
import { teamMembers as mockTeamMembers } from "@/data/teamData";

export function useTeamMembers() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTeamMembers() {
      setIsLoading(true);
      setError(null);
      
      try {
        // In a real app, we would fetch from Supabase here
        // For now, let's use our mock data since Supabase integration has issues
        setTeamMembers(mockTeamMembers);
      } catch (err) {
        console.error('Error fetching team members:', err);
        setError('Failed to load team members');
        setTeamMembers([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchTeamMembers();
  }, []);

  return { teamMembers, isLoading, error };
}
