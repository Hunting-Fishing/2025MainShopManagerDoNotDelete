
import { useState } from "react";
import { Role } from "@/types/team";
import { useRoleFilter } from "./roles/useRoleFilter";
import { useRoleActions } from "./roles/useRoleActions";
import { useRoleImportExport } from "./roles/useRoleImportExport";

export function useRoleManagement(initialRoles: Role[]) {
  const [roles, setRoles] = useState<Role[]>(initialRoles);
  
  // Import role management sub-hooks
  const { searchQuery, setSearchQuery, typeFilter, setTypeFilter, filterRoles } = useRoleFilter();
  const { handleAddRole, handleEditRole, handleDeleteRole, handleDuplicateRole } = useRoleActions(roles, setRoles);
  const { handleImportRoles } = useRoleImportExport(roles, setRoles);

  // Apply filters to roles
  const filteredRoles = filterRoles(roles);

  return {
    roles,
    filteredRoles,
    searchQuery,
    setSearchQuery,
    typeFilter,
    setTypeFilter,
    handleAddRole,
    handleEditRole,
    handleDeleteRole,
    handleDuplicateRole,
    handleImportRoles
  };
}
