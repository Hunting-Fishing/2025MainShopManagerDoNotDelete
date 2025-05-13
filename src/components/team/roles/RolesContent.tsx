
import React from "react";
import { Role } from "@/types/team";
import { Card } from "@/components/ui/card";
import { RolesSearch } from "./RolesSearch";
import { RolesGrid } from "./RolesGrid";

interface RolesContentProps {
  roles: Role[];
  searchQuery: string;
  onSearchChange: (value: string) => void;
  typeFilter: string;
  onTypeFilterChange: (value: string) => void;
  onEditRole: (role: Role) => void;
  onDeleteRole: (role: Role) => void;
  onDuplicateRole: (role: Role) => void;
  onReorderRole: (roleId: string, direction: 'up' | 'down') => boolean;
}

export function RolesContent({
  roles,
  searchQuery,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  onEditRole,
  onDeleteRole,
  onDuplicateRole,
  onReorderRole
}: RolesContentProps) {
  return (
    <Card className="p-6 border shadow-sm bg-white">
      <RolesSearch 
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        typeFilter={typeFilter}
        onTypeFilterChange={onTypeFilterChange}
      />

      <RolesGrid 
        roles={roles} 
        onEditRole={onEditRole}
        onDeleteRole={onDeleteRole}
        onDuplicateRole={onDuplicateRole}
        onReorderRole={onReorderRole}
      />
    </Card>
  );
}
