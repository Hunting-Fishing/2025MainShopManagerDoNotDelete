
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { TeamMember } from "@/types/team";
import { toast } from "sonner";

interface DeleteMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: TeamMember;
}

export function DeleteMemberDialog({ open, onOpenChange, member }: DeleteMemberDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();
  
  const handleDelete = async () => {
    setIsDeleting(true);
    
    try {
      // In a real app, this would delete the member from your backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success(`Team member ${member.name} has been deleted`);
      onOpenChange(false);
      navigate("/team");
    } catch (error) {
      toast.error("Failed to delete team member");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure you want to delete this team member?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently remove <strong>{member.name}</strong> from your organization.
            Any work orders assigned to this team member will need to be reassigned.
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
