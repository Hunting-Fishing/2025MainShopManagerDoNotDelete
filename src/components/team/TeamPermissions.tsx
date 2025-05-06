
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PermissionModuleCard } from "./permissions/PermissionModuleCard";
import { PermissionPresetButtons } from "./permissions/PermissionPresetButtons";
import { PermissionSet } from "@/types/permissions";
import { permissionPresets, defaultPermissions } from "@/data/permissionPresets";

interface TeamPermissionsProps {
  memberId?: string;
  memberRole?: string;
  initialPermissions?: PermissionSet;
  onChange?: (permissions: PermissionSet) => void;
}

export function TeamPermissions({ memberId, memberRole, initialPermissions, onChange }: TeamPermissionsProps) {
  const [activePreset, setActivePreset] = useState<string | null>(memberRole || null);
  const [permissions, setPermissions] = useState<PermissionSet>(
    initialPermissions || 
    (memberRole && permissionPresets[memberRole]) ? 
      permissionPresets[memberRole as keyof typeof permissionPresets] : 
      defaultPermissions
  );
  
  const handlePresetChange = (preset: string | null) => {
    setActivePreset(preset);
    
    if (preset && permissionPresets[preset as keyof typeof permissionPresets]) {
      const newPermissions = permissionPresets[preset as keyof typeof permissionPresets];
      setPermissions(newPermissions);
      if (onChange) onChange(newPermissions);
    }
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Role Permissions</CardTitle>
          <CardDescription>
            Configure what this team member can access and modify within the system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <PermissionPresetButtons 
            activePreset={activePreset}
            onSelectPreset={handlePresetChange}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PermissionModuleCard 
              title="Work Orders"
              description="Access to view and manage work orders"
              permissions={[
                { label: "View work orders", id: "workOrders.view" },
                { label: "Create work orders", id: "workOrders.create" },
                { label: "Edit work orders", id: "workOrders.edit" },
                { label: "Delete work orders", id: "workOrders.delete" },
                { label: "Assign work orders", id: "workOrders.assign" },
              ]}
            />
            
            <PermissionModuleCard 
              title="Customers"
              description="Access to view and manage customer data"
              permissions={[
                { label: "View customers", id: "customers.view" },
                { label: "Create customers", id: "customers.create" },
                { label: "Edit customers", id: "customers.edit" },
                { label: "Delete customers", id: "customers.delete" },
              ]}
            />
            
            <PermissionModuleCard 
              title="Invoices"
              description="Access to view and manage invoices"
              permissions={[
                { label: "View invoices", id: "invoices.view" },
                { label: "Create invoices", id: "invoices.create" },
                { label: "Edit invoices", id: "invoices.edit" },
                { label: "Delete invoices", id: "invoices.delete" },
              ]}
            />
            
            <PermissionModuleCard 
              title="Inventory"
              description="Access to view and manage inventory"
              permissions={[
                { label: "View inventory", id: "inventory.view" },
                { label: "Create inventory items", id: "inventory.create" },
                { label: "Edit inventory items", id: "inventory.edit" },
                { label: "Delete inventory items", id: "inventory.delete" },
              ]}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
