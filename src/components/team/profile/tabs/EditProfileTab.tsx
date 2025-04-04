
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { TeamMemberForm } from "@/components/team/TeamMemberForm";
import { TeamMemberFormValues } from "@/components/team/form/formValidation";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface EditProfileTabProps {
  initialData: TeamMemberFormValues;
}

export function EditProfileTab({ initialData }: EditProfileTabProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const handleUpdateSuccess = () => {
    toast({
      title: "Success",
      description: "Team member profile has been updated successfully. Changes will be visible on refresh.",
    });
    
    // Navigate back to the team page or refresh current page
    setTimeout(() => {
      // This will reload the page to show updated data
      window.location.reload();
    }, 1500);
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
          onUpdateSuccess={handleUpdateSuccess}
        />
      </CardContent>
    </Card>
  );
}
