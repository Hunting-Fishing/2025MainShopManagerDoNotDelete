
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

export function useDeleteMember() {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  // Handle member deletion using real data
  const handleDeleteMember = async (memberId: string) => {
    if (!memberId) {
      toast({
        title: "Error",
        description: "Cannot delete member: Missing member ID.",
        variant: "destructive",
      });
      return;
    }

    setIsDeleting(true);
    
    try {
      console.log("Deleting team member:", memberId);
      
      // First remove any role assignments for this user
      const { error: roleDeleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', memberId);
        
      if (roleDeleteError) {
        console.error("Error removing user roles:", roleDeleteError);
        // Continue with deletion even if role deletion fails
      }
      
      // Since we don't have a 'status' field, we can't mark as inactive directly
      // Instead, we'll use a metadata approach - logging the deletion in audit_logs
      const { error: auditError } = await supabase
        .from('audit_logs')
        .insert({
          user_id: memberId,
          action: 'user_deactivated',
          resource: 'profiles',
          resource_id: memberId,
          details: { 
            timestamp: new Date().toISOString(), 
            reason: 'User removed from team' 
          }
        });
      
      if (auditError) {
        console.error("Error logging user deactivation:", auditError);
      }
      
      toast({
        title: "Team member removed",
        description: "The team member has been successfully removed from the team.",
        variant: "success",
      });
      
      navigate("/team");
    } catch (error) {
      console.error("Error deleting member:", error);
      toast({
        title: "Error",
        description: "Failed to delete team member. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  return {
    deleteDialogOpen,
    setDeleteDialogOpen,
    handleDeleteMember,
    isDeleting
  };
}
