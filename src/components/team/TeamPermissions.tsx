
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { PermissionSet, RolePreset } from "@/types/permissions";
import { defaultPermissions, permissionPresets } from "@/data/permissionPresets";
import { PermissionModuleCard } from "./permissions/PermissionModuleCard";
import { PermissionPresetButtons } from "./permissions/PermissionPresetButtons";

interface TeamPermissionsProps {
  memberRole: string;
  initialPermissions?: PermissionSet;
  onChange?: (permissions: PermissionSet) => void;
}

export function TeamPermissions({ 
  memberRole, 
  initialPermissions, 
  onChange 
}: TeamPermissionsProps) {
  // Initialize with either provided permissions, role preset, or defaults
  const [permissions, setPermissions] = useState<PermissionSet>(
    initialPermissions || 
    (memberRole ? permissionPresets[memberRole as keyof typeof permissionPresets] : defaultPermissions)
  );

  // Handle toggling a permission
  const handleTogglePermission = (module: string, action: string, value: boolean) => {
    const updatedPermissions = {
      ...permissions,
      [module]: {
        ...permissions[module as keyof typeof permissions],
        [action]: value,
      },
    } as PermissionSet;
    
    setPermissions(updatedPermissions);
    
    if (onChange) {
      onChange(updatedPermissions);
    }
  };

  // Apply a permission preset based on role
  const applyPreset = (role: RolePreset) => {
    if (role in permissionPresets) {
      const preset = permissionPresets[role];
      setPermissions(preset);
      
      if (onChange) {
        onChange(preset);
      }
      
      toast({
        title: "Permissions updated",
        description: `Applied ${role} permission preset`,
      });
    }
  };

  // Save permissions (in a real app, this would save to backend)
  const savePermissions = () => {
    console.log("Saving permissions:", permissions);
    
    // Simulate API call delay
    setTimeout(() => {
      toast({
        title: "Permissions saved",
        description: "User permissions have been updated successfully",
      });
    }, 500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Permissions & Access</h2>
          <p className="text-sm text-slate-500">
            Configure what this team member can access and modify in the system
          </p>
        </div>
        
        <PermissionPresetButtons onApplyPreset={applyPreset} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(permissions).map(([module, actions]) => (
          <PermissionModuleCard
            key={module}
            moduleName={module}
            actions={actions}
            onTogglePermission={handleTogglePermission}
          />
        ))}
      </div>

      <div className="flex justify-end">
        <Button 
          onClick={savePermissions}
          className="bg-esm-blue-600 hover:bg-esm-blue-700"
        >
          Save Permissions
        </Button>
      </div>
    </div>
  );
}
