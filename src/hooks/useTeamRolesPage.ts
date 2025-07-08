import { useState, useEffect, useMemo } from "react";
import { PermissionSet } from "@/types/permissions";
import { useRoles, DatabaseRole } from "@/hooks/roles/useRoles";
import { useRoleAssignments } from "@/hooks/roles/useRoleAssignments";
import { toast } from "@/hooks/use-toast";

// Transform database role to UI role format
const transformDatabaseRoleToUIRole = (dbRole: DatabaseRole) => ({
  id: dbRole.id,
  name: dbRole.name,
  description: dbRole.description || "",
  isDefault: dbRole.is_default,
  permissions: dbRole.permissions as PermissionSet,
  createdAt: dbRole.created_at,
  updatedAt: dbRole.updated_at,
  priority: 1, // Default priority for sorting
  memberCount: dbRole.member_count,
  members: dbRole.members
});

export function useTeamRolesPage() {
  const { roles: dbRoles, loading, createRole, updateRole, deleteRole } = useRoles();
  const { assignRole, removeUserFromRole } = useRoleAssignments();

  // Transform database roles to UI format
  const roles = useMemo(() => 
    dbRoles.map(transformDatabaseRoleToUIRole), 
    [dbRoles]
  );

  // Filtering state
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  // Filter roles based on search and type
  const filteredRoles = useMemo(() => {
    let filtered = roles;

    if (searchQuery) {
      filtered = filtered.filter(role =>
        role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        role.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter(role => {
        if (typeFilter === "default") return role.isDefault;
        if (typeFilter === "custom") return !role.isDefault;
        return true;
      });
    }

    return filtered;
  }, [roles, searchQuery, typeFilter]);

  // Dialog state
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Form state
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDescription, setNewRoleDescription] = useState("");
  const [currentRole, setCurrentRole] = useState<any>(null);
  const [rolePermissions, setRolePermissions] = useState<PermissionSet | null>(null);

  const handleExportRoles = () => {
    // Export database roles as JSON
    const exportData = JSON.stringify(roles, null, 2);
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'roles-export.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Roles Exported",
      description: "Your roles have been exported to a JSON file",
    });
  };

  const onAddRole = async () => {
    if (!rolePermissions) {
      toast({
        title: "Error",
        description: "Please configure role permissions",
        variant: "destructive",
      });
      return;
    }

    try {
      await createRole(newRoleName, newRoleDescription, rolePermissions);
      setIsAddDialogOpen(false);
      setNewRoleName("");
      setNewRoleDescription("");
      setRolePermissions(null);
    } catch (error) {
      // Error is handled in the createRole function
    }
  };

  const onEditRole = async () => {
    if (!currentRole || !rolePermissions) return;
    
    try {
      await updateRole(currentRole.id, {
        name: currentRole.name,
        description: currentRole.description,
        permissions: rolePermissions
      });
      setIsEditDialogOpen(false);
      setCurrentRole(null);
      setRolePermissions(null);
    } catch (error) {
      // Error is handled in the updateRole function
    }
  };

  const onDeleteRole = async () => {
    if (!currentRole) return;
    
    try {
      await deleteRole(currentRole.id);
      setIsDeleteDialogOpen(false);
      setCurrentRole(null);
    } catch (error) {
      // Error is handled in the deleteRole function
    }
  };

  const handleEditRoleClick = (role: any) => {
    setCurrentRole(role);
    setRolePermissions(role.permissions as PermissionSet);
    setIsEditDialogOpen(true);
  };

  const handleDeleteRoleClick = (role: any) => {
    setCurrentRole(role);
    setIsDeleteDialogOpen(true);
  };

  const handleDuplicateRoleClick = async (role: any) => {
    try {
      await createRole(
        `${role.name} (Copy)`,
        role.description,
        role.permissions
      );
    } catch (error) {
      // Error is handled in the createRole function
    }
  };

  const handleReorderRole = (roleId: string, direction: 'up' | 'down') => {
    // For now, return false as reordering would require additional database logic
    toast({
      title: "Info",
      description: "Role reordering is not yet implemented",
    });
    return false;
  };

  const handleImportRoles = (importedRoles: any[]) => {
    toast({
      title: "Info", 
      description: "Role importing is not yet implemented",
    });
  };

  useEffect(() => {
    if (!isAddDialogOpen) {
      setNewRoleName("");
      setNewRoleDescription("");
      setRolePermissions(null);
    }
  }, [isAddDialogOpen]);

  useEffect(() => {
    if (!isEditDialogOpen) {
      setCurrentRole(null);
      setRolePermissions(null);
    }
  }, [isEditDialogOpen]);

  return {
    filteredRoles,
    searchQuery,
    setSearchQuery,
    typeFilter,
    setTypeFilter,
    isAddDialogOpen,
    setIsAddDialogOpen,
    isEditDialogOpen,
    setIsEditDialogOpen,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    newRoleName,
    setNewRoleName,
    newRoleDescription,
    setNewRoleDescription,
    currentRole,
    setCurrentRole,
    rolePermissions,
    setRolePermissions,
    handleExportRoles,
    onAddRole,
    onEditRole,
    onDeleteRole,
    handleEditRoleClick,
    handleDeleteRoleClick,
    handleDuplicateRoleClick,
    handleReorderRole,
    handleImportRoles,
    loading,
    assignRole,
    removeUserFromRole
  };
}
