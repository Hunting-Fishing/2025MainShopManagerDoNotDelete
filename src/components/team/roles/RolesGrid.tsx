
import React from "react";
import { RoleCard } from "./RoleCard";
import { Role } from "@/types/team";

interface RolesGridProps {
  roles: Role[];
  onEditRole: (role: Role) => void;
  onDeleteRole: (role: Role) => void;
}

export function RolesGrid({ roles, onEditRole, onDeleteRole }: RolesGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {roles.map(role => (
        <RoleCard 
          key={role.id} 
          role={role} 
          onEdit={onEditRole} 
          onDelete={onDeleteRole}
        />
      ))}
    </div>
  );
}
