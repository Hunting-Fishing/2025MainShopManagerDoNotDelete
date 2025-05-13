import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { PermissionSet, RolePreset } from "@/types/permissions";
import { defaultPermissions, permissionPresets } from "@/data/permissionPresets";
import { PermissionModuleCard } from "./permissions/PermissionModuleCard";
import { PermissionPresetButtons } from "./permissions/PermissionPresetButtons";
import { ResponsiveGrid } from "@/components/ui/responsive-grid";

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
  // Get the appropriate permissions for the role, with fallbacks
  const getInitialPermissions = (): PermissionSet => {
    // If initialPermissions are provided, use those
    if (initialPermissions) {
      return initialPermissions;
    }
    
    // If memberRole is provided and exists in permissionPresets, use those
    if (memberRole && permissionPresets[memberRole as keyof typeof permissionPresets]) {
      return permissionPresets[memberRole as keyof typeof permissionPresets];
    }
    
    // Otherwise use default permissions
    return defaultPermissions;
  };

  // Initialize with safe permissions
  const [permissions, setPermissions] = useState<PermissionSet>(getInitialPermissions());

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
        variant: "success",
      });
    }
  };

  // Save permissions (in a real app, this would save to backend)
  const savePermissions = () => {
    console.log("Saving permissions:", permissions);
    
    // Simulate API call delay
    setTimeout(() => {
      toast({
        title: "Permissions saved successfully",
        description: "User permissions have been updated successfully",
        variant: "success",
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

      <ResponsiveGrid 
        cols={{ 
          default: 1, 
          md: 2, 
          lg: 2, 
          xl: 3 
        }}
        gap="md"
        className="w-full"
      >
        {permissions && Object.entries(permissions).map(([module, actions]) => (
          <PermissionModuleCard
            key={module}
            moduleName={module}
            actions={actions}
            onTogglePermission={handleTogglePermission}
          />
        ))}
      </ResponsiveGrid>

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
