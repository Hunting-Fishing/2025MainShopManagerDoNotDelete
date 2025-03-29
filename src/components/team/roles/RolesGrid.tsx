
import React from "react";
import { RoleCard } from "./RoleCard";
import { Role } from "@/types/team";

interface RolesGridProps {
  roles: Role[];
  onEditRole: (role: Role) => void;
  onDeleteRole: (role: Role) => void;
}

export function RolesGrid({ roles, onEditRole, onDeleteRole }: RolesGridProps) {
  if (roles.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 bg-slate-50 rounded-lg">
        <p className="text-slate-500">No roles match your search criteria.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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
