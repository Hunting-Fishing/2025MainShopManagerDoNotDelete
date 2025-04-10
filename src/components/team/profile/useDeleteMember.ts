
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
      
      // Create a profile_metadata record for this user with inactive status
      // First check if metadata exists
      const { data: existingMetadata } = await supabase
        .from('profile_metadata')
        .select('*')
        .eq('profile_id', memberId)
        .single();
      
      if (existingMetadata) {
        // Update existing metadata to mark user as inactive
        const { error: updateError } = await supabase
          .from('profile_metadata')
          .update({
            metadata: {
              ...existingMetadata.metadata,
              status: 'inactive',
              deactivated_at: new Date().toISOString(),
              is_active: false
            }
          })
          .eq('profile_id', memberId);
          
        if (updateError) {
          console.error("Error updating profile metadata:", updateError);
          throw updateError;
        }
      } else {
        // Create new metadata entry with inactive status
        const { error: insertError } = await supabase
          .from('profile_metadata')
          .insert({
            profile_id: memberId,
            metadata: {
              status: 'inactive',
              deactivated_at: new Date().toISOString(),
              is_active: false
            }
          });
          
        if (insertError) {
          console.error("Error creating profile metadata:", insertError);
          throw insertError;
        }
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
