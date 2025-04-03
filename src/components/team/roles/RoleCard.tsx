
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Role } from "@/types/team";
import { PermissionSet } from "@/types/permissions";
import { RoleCardHeader } from "./RoleCardHeader";
import { RoleCardBadges } from "./RoleCardBadges";
import { RoleCardPermissions } from "./RoleCardPermissions";

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
    <Card key={role.id} className={`${role.isDefault ? "border-slate-200" : "border-esm-blue-200"} hover:shadow-md transition-shadow`}>
      <CardHeader className="pb-2">
        <RoleCardHeader 
          role={role}
          onEdit={onEdit}
          onDelete={onDelete}
          onDuplicate={onDuplicate}
          onReorder={onReorder}
          isFirst={isFirst}
          isLast={isLast}
        />
      </CardHeader>
      <CardContent>
        <p className="text-sm text-slate-500 mb-2">{role.description}</p>
        
        <RoleCardBadges 
          role={role} 
          totalEnabledPermissions={totalEnabled} 
        />
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="p-0 h-auto text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1 mb-2"
          onClick={() => setShowPermissions(!showPermissions)}
        >
          {showPermissions ? "Hide permissions" : "Show permissions"}
          {showPermissions ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </Button>
        
        {showPermissions && <RoleCardPermissions keyPermissions={keyPermissions} />}
      </CardContent>
    </Card>
  );
}
