
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

interface TeamPermissionsProps {
  memberId: string;
}

export function TeamPermissions({ memberId }: TeamPermissionsProps) {
  const [activePreset, setActivePreset] = useState<string | null>(null);
  
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
            onSelectPreset={setActivePreset}
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
