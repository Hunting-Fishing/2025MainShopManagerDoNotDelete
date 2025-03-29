
import { TeamMemberForm } from "@/components/team/TeamMemberForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function CreateMemberCard() {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Team Member Information</CardTitle>
        <CardDescription>
          Add a new member to your team and configure their role and permissions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <TeamMemberForm mode="create" />
      </CardContent>
    </Card>
  );
}
