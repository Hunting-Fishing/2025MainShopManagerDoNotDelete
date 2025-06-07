import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { recordTeamMemberHistory } from '@/utils/team/history/recordHistory';

interface RoleAssignmentProps {
  currentUserName: string;
  currentUserId: string;
}

export const useRoleAssignment = ({ currentUserName, currentUserId }: RoleAssignmentProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const assignRole = async (userId: string, roleId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('assign_role_to_user', {
        user_id_param: userId,
        role_id_param: roleId,
      });
      
      if (error) throw error;
      
      // Record the action in history
      await recordTeamMemberHistory({
        profile_id: userId,
        action_type: 'role_assigned',
        action_by: currentUserId,
        action_by_name: currentUserName,
        details: { role_id: roleId }
      });
      
      toast({
        title: "Role assigned successfully",
        description: "The user's role has been updated.",
      });
      
      return { success: true };
    } catch (error: any) {
      console.error("Error assigning role:", error);
      toast({
        title: "Error assigning role",
        description: error.message || "An error occurred while assigning the role.",
        variant: "destructive",
      });
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };
  
  const removeRole = async (userRoleId: string, userId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('remove_role_from_user', {
        user_role_id_param: userRoleId,
      });
      
      if (error) throw error;
      
      // Record the action in history
      await recordTeamMemberHistory({
        profile_id: userId,
        action_type: 'role_removed',
        action_by: currentUserId,
        action_by_name: currentUserName,
        details: { user_role_id: userRoleId }
      });
      
      toast({
        title: "Role removed successfully",
        description: "The user's role has been updated.",
      });
      
      return { success: true };
    } catch (error: any) {
      console.error("Error removing role:", error);
      toast({
        title: "Error removing role",
        description: error.message || "An error occurred while removing the role.",
        variant: "destructive",
      });
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  return { assignRole, removeRole, loading };
};
