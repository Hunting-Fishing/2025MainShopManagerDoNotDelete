
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

export interface TeamMember {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  job_title?: string;
  department?: string;
  status?: string;
  notes?: string;
  skills?: string[];
  certifications?: any[];
  created_at?: string;
  updated_at?: string;
}

export function useTeamMembers() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch team members
      const { data, error } = await supabase
        .from('team_members')
        .select('*');

      if (error) {
        throw error;
      }
      
      // For each member, fetch their skills and certifications
      const membersWithDetails = await Promise.all(
        (data || []).map(async (member) => {
          // Fetch skills
          const { data: skillsData } = await supabase
            .from('team_member_skills')
            .select('skill_name')
            .eq('team_member_id', member.id);
          
          // Fetch certifications
          const { data: certData } = await supabase
            .from('team_member_certifications')
            .select('*')
            .eq('team_member_id', member.id);
          
          return {
            ...member,
            skills: skillsData ? skillsData.map(s => s.skill_name) : [],
            certifications: certData || []
          };
        })
      );
      
      setMembers(membersWithDetails);
    } catch (err) {
      console.error('Error fetching team members:', err);
      setError(err instanceof Error ? err.message : 'Failed to load team members');
      toast({
        title: 'Error',
        description: 'Failed to load team members',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const createMember = useCallback(async (member: Omit<TeamMember, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      // Insert the new member
      const { data, error } = await supabase
        .from('team_members')
        .insert([member])
        .select();

      if (error) {
        throw error;
      }

      const newMember = data?.[0];
      if (newMember) {
        // Add skills if provided
        if (member.skills && member.skills.length > 0) {
          for (const skill of member.skills) {
            await supabase
              .from('team_member_skills')
              .insert([{
                team_member_id: newMember.id,
                skill_name: skill
              }]);
          }
        }
        
        // Add certifications if provided
        if (member.certifications && member.certifications.length > 0) {
          for (const cert of member.certifications) {
            await supabase
              .from('team_member_certifications')
              .insert([{
                team_member_id: newMember.id,
                ...cert
              }]);
          }
        }
        
        // Add new member to state
        setMembers(prev => [...prev, {
          ...newMember,
          skills: member.skills || [],
          certifications: member.certifications || []
        }]);
        
        toast({
          title: 'Success',
          description: 'Team member added successfully',
        });
      }
      
      return newMember;
    } catch (err) {
      console.error('Error creating team member:', err);
      toast({
        title: 'Error',
        description: 'Failed to add team member',
        variant: 'destructive',
      });
      return null;
    }
  }, []);

  // Try checking if the table exists another way
  const checkIfTableExists = async (tableName: string): Promise<boolean> => {
    try {
      // We'll do a dummy select that will fail if the table doesn't exist
      const { error } = await supabase
        .from(tableName)
        .select('count')
        .limit(1);

      // If no error, table exists
      return !error;
    } catch (err) {
      return false;
    }
  };

  return {
    members,
    loading,
    error,
    fetchMembers,
    createMember,
    checkIfTableExists
  };
}
