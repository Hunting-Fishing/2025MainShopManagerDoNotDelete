
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle, XCircle } from "lucide-react";

// Default permissions structure
const defaultPermissions = {
  workOrders: {
    view: true,
    create: false,
    edit: false,
    delete: false,
    assign: false,
  },
  inventory: {
    view: true,
    create: false,
    edit: false,
    delete: false,
  },
  invoices: {
    view: true,
    create: false,
    edit: false,
    delete: false,
  },
  customers: {
    view: true,
    create: false,
    edit: false,
    delete: false,
  },
  team: {
    view: false,
    create: false,
    edit: false,
    delete: false,
  },
  reports: {
    view: false,
    generate: false,
  },
  settings: {
    view: false,
    edit: false,
  },
};

// Permission presets for different roles
const permissionPresets = {
  Owner: {
    ...defaultPermissions,
    workOrders: { view: true, create: true, edit: true, delete: true, assign: true },
    inventory: { view: true, create: true, edit: true, delete: true },
    invoices: { view: true, create: true, edit: true, delete: true },
    customers: { view: true, create: true, edit: true, delete: true },
    team: { view: true, create: true, edit: true, delete: true },
    reports: { view: true, generate: true },
    settings: { view: true, edit: true },
  },
  Administrator: {
    ...defaultPermissions,
    workOrders: { view: true, create: true, edit: true, delete: true, assign: true },
    inventory: { view: true, create: true, edit: true, delete: false },
    invoices: { view: true, create: true, edit: true, delete: false },
    customers: { view: true, create: true, edit: true, delete: false },
    team: { view: true, create: false, edit: false, delete: false },
    reports: { view: true, generate: true },
    settings: { view: true, edit: false },
  },
  Technician: {
    ...defaultPermissions,
    workOrders: { view: true, create: true, edit: true, delete: false, assign: false },
    inventory: { view: true, create: false, edit: false, delete: false },
    invoices: { view: true, create: true, edit: false, delete: false },
    customers: { view: true, create: false, edit: false, delete: false },
  },
  "Customer Service": {
    ...defaultPermissions,
    workOrders: { view: true, create: true, edit: true, delete: false, assign: false },
    customers: { view: true, create: true, edit: true, delete: false },
    invoices: { view: true, create: true, edit: false, delete: false },
  },
};

interface TeamPermissionsProps {
  memberRole: string;
  initialPermissions?: any;
  onChange?: (permissions: any) => void;
}

export function TeamPermissions({ 
  memberRole, 
  initialPermissions, 
  onChange 
}: TeamPermissionsProps) {
  // Initialize with either provided permissions, role preset, or defaults
  const [permissions, setPermissions] = useState(
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
    };
    
    setPermissions(updatedPermissions);
    
    if (onChange) {
      onChange(updatedPermissions);
    }
  };

  // Apply a permission preset based on role
  const applyPreset = (role: string) => {
    if (role in permissionPresets) {
      const preset = permissionPresets[role as keyof typeof permissionPresets];
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
        
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => applyPreset("Owner")}
          >
            Owner Preset
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => applyPreset("Administrator")}
          >
            Admin Preset
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => applyPreset("Technician")}
          >
            Technician Preset
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => applyPreset("Customer Service")}
          >
            CS Preset
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(permissions).map(([module, actions]) => (
          <Card key={module} className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="capitalize">{module}</CardTitle>
              <CardDescription>
                Configure access to {module.toLowerCase()} module
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {Object.entries(actions as Record<string, boolean>).map(([action, value]) => (
                  <li key={`${module}-${action}`} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {value ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-slate-300" />
                      )}
                      <span className="capitalize">{action}</span>
                    </div>
                    <Switch
                      checked={value}
                      onCheckedChange={(checked) => 
                        handleTogglePermission(module, action, checked)
                      }
                    />
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
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
