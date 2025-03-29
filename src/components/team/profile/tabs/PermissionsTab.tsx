
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TeamPermissions } from "@/components/team/TeamPermissions";
import { PermissionSet } from "@/types/permissions";
import { TeamMember } from "@/types/team";

interface PermissionsTabProps {
  member: TeamMember;
}

export function PermissionsTab({ member }: PermissionsTabProps) {
  const [permissions, setPermissions] = useState<PermissionSet | null>(null);

  const handlePermissionsChange = (updatedPermissions: PermissionSet) => {
    setPermissions(updatedPermissions);
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Permissions & Access Control</CardTitle>
        <CardDescription>
          Configure what {member.name} can access and modify in the system
        </CardDescription>
      </CardHeader>
      <CardContent>
        <TeamPermissions 
          memberRole={member.role} 
          onChange={handlePermissionsChange}
        />
      </CardContent>
    </Card>
  );
}
