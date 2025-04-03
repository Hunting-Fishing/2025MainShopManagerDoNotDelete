
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TeamPermissions } from "@/components/team/TeamPermissions";
import { PermissionSet } from "@/types/permissions";
import { TeamMember } from "@/types/team";
import { permissionPresets, defaultPermissions } from "@/data/permissionPresets";

interface PermissionsTabProps {
  member: TeamMember;
}

export function PermissionsTab({ member }: PermissionsTabProps) {
  // Initialize with appropriate defaults based on member's role
  const initialPermissions = member.role && permissionPresets[member.role as keyof typeof permissionPresets] 
    ? permissionPresets[member.role as keyof typeof permissionPresets]
    : defaultPermissions;
    
  const [permissions, setPermissions] = useState<PermissionSet>(initialPermissions);

  // Update permissions when member role changes
  useEffect(() => {
    if (member.role && permissionPresets[member.role as keyof typeof permissionPresets]) {
      setPermissions(permissionPresets[member.role as keyof typeof permissionPresets]);
    }
  }, [member.role]);

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
          initialPermissions={permissions}
          onChange={handlePermissionsChange}
        />
      </CardContent>
    </Card>
  );
}
