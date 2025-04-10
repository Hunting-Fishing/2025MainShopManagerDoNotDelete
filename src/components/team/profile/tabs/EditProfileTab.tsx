
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { TeamMemberForm } from "@/components/team/form/TeamMemberForm";
import { TeamMemberFormValues } from "@/components/team/form/formValidation";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useTeamMemberUpdate } from "@/hooks/useTeamMemberUpdate";
import { useState } from "react";

interface EditProfileTabProps {
  initialData: TeamMemberFormValues;
}

export function EditProfileTab({ initialData }: EditProfileTabProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { updateTeamMember } = useTeamMemberUpdate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (data: TeamMemberFormValues) => {
    if (!initialData?.id) return;
    
    setIsSubmitting(true);
    try {
      const success = await updateTeamMember(initialData.id, data);
      if (success) {
        toast({
          title: "Success",
          description: "Team member profile has been updated successfully. Changes will be visible on refresh.",
        });
        
        // This will reload the page to show updated data
        setTimeout(() => window.location.reload(), 1500);
      }
    } catch (error: any) {
      toast({
        title: "Error updating team member",
        description: error.message || "There was a problem updating the team member. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Edit Team Member</CardTitle>
        <CardDescription>
          Update this team member's information and settings
        </CardDescription>
      </CardHeader>
      <CardContent>
        <TeamMemberForm 
          initialData={initialData} 
          mode="edit" 
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </CardContent>
    </Card>
  );
}
