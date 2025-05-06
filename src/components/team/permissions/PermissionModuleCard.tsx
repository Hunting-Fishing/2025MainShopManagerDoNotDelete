
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Permission {
  id: string;
  label: string;
}

interface PermissionModuleCardProps {
  title: string;
  description: string;
  permissions: Permission[];
}

export function PermissionModuleCard({ title, description, permissions }: PermissionModuleCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {permissions.map((permission) => (
            <div key={permission.id} className="flex items-center justify-between">
              <label htmlFor={permission.id} className="text-sm">
                {permission.label}
              </label>
              <Switch id={permission.id} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
