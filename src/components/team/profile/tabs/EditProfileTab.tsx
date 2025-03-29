
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { TeamMemberForm } from "@/components/team/TeamMemberForm";
import { TeamMemberFormValues } from "@/components/team/form/formValidation";

interface EditProfileTabProps {
  initialData: TeamMemberFormValues;
}

export function EditProfileTab({ initialData }: EditProfileTabProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Edit Team Member</CardTitle>
        <CardDescription>
          Update this team member's information and settings
        </CardDescription>
      </CardHeader>
      <CardContent>
        <TeamMemberForm initialData={initialData} mode="edit" />
      </CardContent>
    </Card>
  );
}
