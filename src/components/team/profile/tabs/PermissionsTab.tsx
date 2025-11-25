
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Shield, Check, X } from "lucide-react";
import { permissionPresets, defaultPermissions } from "@/data/permissionPresets";

interface PermissionsTabProps {
  memberRole: string;
}

export function PermissionsTab({ memberRole }: PermissionsTabProps) {
  // Get permissions for this role
  const permissions = permissionPresets[memberRole as keyof typeof permissionPresets] || defaultPermissions;

  const PermissionRow = ({ label, allowed }: { label: string; allowed: boolean }) => (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-foreground">{label}</span>
      <div className="flex items-center gap-2">
        {allowed ? (
          <Check className="h-4 w-4 text-green-600" />
        ) : (
          <X className="h-4 w-4 text-muted-foreground" />
        )}
      </div>
    </div>
  );

  const PermissionModule = ({ 
    title, 
    permissions: modulePerms 
  }: { 
    title: string; 
    permissions: Record<string, boolean>;
  }) => (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {Object.entries(modulePerms).map(([key, value]) => (
            <PermissionRow 
              key={key} 
              label={key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')} 
              allowed={value} 
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle>Role Permissions</CardTitle>
          </div>
          <CardDescription>
            These are the permissions assigned to the <strong>{memberRole}</strong> role
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Current Role:</span>
            <Badge variant="outline" className="text-base px-3 py-1">
              {memberRole}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PermissionModule title="Work Orders" permissions={permissions.workOrders} />
        <PermissionModule title="Inventory" permissions={permissions.inventory} />
        <PermissionModule title="Invoices" permissions={permissions.invoices} />
        <PermissionModule title="Customers" permissions={permissions.customers} />
        <PermissionModule title="Team" permissions={permissions.team} />
        <PermissionModule title="Reports" permissions={permissions.reports} />
        <PermissionModule title="Settings" permissions={permissions.settings} />
      </div>

      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> Permissions are managed at the role level. To modify this user's permissions, 
            either change their role or modify the role's permissions in Settings → Roles.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
