
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { TeamMemberForm } from "@/components/team/TeamMemberForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function TeamMemberCreate() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          asChild
        >
          <Link to="/team">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Add Team Member</h1>
      </div>

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
    </div>
  );
}
