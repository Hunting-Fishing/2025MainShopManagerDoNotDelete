
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Edit, 
  Trash, 
  Shield, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  XCircle,
  Copy,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import { Role } from "@/types/team";
import { PermissionSet } from "@/types/permissions";

interface RoleCardProps {
  role: Role;
  onEdit: (role: Role) => void;
  onDelete: (role: Role) => void;
  onDuplicate: (role: Role) => void;
  onReorder: (roleId: string, direction: 'up' | 'down') => boolean;
  isFirst: boolean;
  isLast: boolean;
}

export function RoleCard({ 
  role, 
  onEdit, 
  onDelete, 
  onDuplicate, 
  onReorder,
  isFirst,
  isLast
}: RoleCardProps) {
  const [showPermissions, setShowPermissions] = useState(false);
  const permissions = role.permissions as PermissionSet;

  // Count total enabled permissions
  const countEnabledPermissions = () => {
    let count = 0;
    
    // Loop through each module
    Object.values(permissions).forEach(moduleActions => {
      // Count enabled actions within each module
      Object.values(moduleActions).forEach(isEnabled => {
        if (isEnabled === true) count++;
      });
    });
    
    return count;
  };

  // Get key permissions to highlight
  const getKeyPermissions = () => {
    return {
      canManageTeam: permissions.team?.edit === true,
      canManageCustomers: permissions.customers?.edit === true,
      canManageWorkOrders: permissions.workOrders?.edit === true,
      canManageInvoices: permissions.invoices?.edit === true,
      canViewReports: permissions.reports?.view === true,
      canAccessSettings: permissions.settings?.view === true,
    };
  };

  const keyPermissions = getKeyPermissions();
  const totalEnabled = countEnabledPermissions();

  return (
    <Card key={role.id} className={role.isDefault ? "border-slate-200" : "border-esm-blue-200"}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-esm-blue-500" />
            <CardTitle>{role.name}</CardTitle>
          </div>
          <div className="flex items-center">
            {/* Reordering buttons */}
            <div className="mr-2 flex flex-col">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => onReorder(role.id, 'up')}
                disabled={isFirst}
                className="h-6 w-6"
                title="Move Up"
              >
                <ArrowUp className="h-3 w-3" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => onReorder(role.id, 'down')}
                disabled={isLast}
                className="h-6 w-6"
                title="Move Down"
              >
                <ArrowDown className="h-3 w-3" />
              </Button>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => onDuplicate(role)}
              title="Duplicate Role"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => onEdit(role)}
              title="Edit Role"
            >
              <Edit className="h-4 w-4" />
            </Button>
            {!role.isDefault && (
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => onDelete(role)}
                title="Delete Role"
              >
                <Trash className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-slate-500 mb-2">{role.description}</p>
        
        <div className="flex flex-wrap gap-2 mb-3">
          {role.isDefault ? (
            <Badge variant="outline" className="bg-slate-100 text-slate-700">
              Default Role
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-esm-blue-50 text-esm-blue-700">
              Custom Role
            </Badge>
          )}
          
          <Badge variant="outline" className="bg-slate-50">
            {totalEnabled} Permissions
          </Badge>
          
          <Badge variant="outline" className="bg-slate-50">
            Priority: {role.priority}
          </Badge>
        </div>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="p-0 h-auto text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1 mb-2"
          onClick={() => setShowPermissions(!showPermissions)}
        >
          {showPermissions ? "Hide permissions" : "Show permissions"}
          {showPermissions ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </Button>
        
        {showPermissions && (
          <div className="mt-2 bg-slate-50 p-2 rounded-md space-y-1.5">
            <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-xs">
              <div className="flex items-center gap-1.5">
                {keyPermissions.canManageTeam ? 
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> : 
                  <XCircle className="h-3.5 w-3.5 text-slate-300" />}
                <span>Manage Team</span>
              </div>
              
              <div className="flex items-center gap-1.5">
                {keyPermissions.canManageWorkOrders ? 
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> : 
                  <XCircle className="h-3.5 w-3.5 text-slate-300" />}
                <span>Manage Work Orders</span>
              </div>
              
              <div className="flex items-center gap-1.5">
                {keyPermissions.canManageCustomers ? 
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> : 
                  <XCircle className="h-3.5 w-3.5 text-slate-300" />}
                <span>Manage Customers</span>
              </div>
              
              <div className="flex items-center gap-1.5">
                {keyPermissions.canManageInvoices ? 
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> : 
                  <XCircle className="h-3.5 w-3.5 text-slate-300" />}
                <span>Manage Invoices</span>
              </div>
              
              <div className="flex items-center gap-1.5">
                {keyPermissions.canViewReports ? 
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> : 
                  <XCircle className="h-3.5 w-3.5 text-slate-300" />}
                <span>View Reports</span>
              </div>
              
              <div className="flex items-center gap-1.5">
                {keyPermissions.canAccessSettings ? 
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> : 
                  <XCircle className="h-3.5 w-3.5 text-slate-300" />}
                <span>Access Settings</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
