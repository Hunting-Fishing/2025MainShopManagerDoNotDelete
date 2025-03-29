import { useState } from "react";
import { Role } from "@/types/team";
import { PermissionSet } from "@/types/permissions";
import { toast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";
import { validateImportedRoles } from "@/utils/roleUtils";

export function useRoleManagement(initialRoles: Role[]) {
  const [roles, setRoles] = useState<Role[]>(initialRoles);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  // Filter roles based on search query and type filter
  const filteredRoles = roles.filter(role => {
    const matchesSearch = role.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (typeFilter === "all") return matchesSearch;
    if (typeFilter === "default") return matchesSearch && role.isDefault;
    if (typeFilter === "custom") return matchesSearch && !role.isDefault;
    
    return matchesSearch;
  });

  const handleAddRole = (
    newRoleName: string, 
    newRoleDescription: string, 
    rolePermissions: PermissionSet | null
  ) => {
    if (!newRoleName.trim()) {
      toast({
        title: "Role name required",
        description: "Please provide a name for the new role",
        variant: "destructive",
      });
      return false;
    }

    if (roles.some(role => role.name.toLowerCase() === newRoleName.toLowerCase())) {
      toast({
        title: "Role already exists",
        description: "A role with this name already exists",
        variant: "destructive",
      });
      return false;
    }

    const newRole: Role = {
      id: `role-${uuidv4()}`,
      name: newRoleName,
      description: newRoleDescription,
      isDefault: false,
      permissions: rolePermissions || {} as PermissionSet,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setRoles([...roles, newRole]);

    toast({
      title: "Role created successfully",
      description: `The role "${newRoleName}" has been created`,
      variant: "success",
    });
    
    return true;
  };

  const handleEditRole = (updatedRole: Role, newPermissions: PermissionSet | null) => {
    if (!updatedRole) return false;

    const updatedRoles = roles.map(role => {
      if (role.id === updatedRole.id) {
        return {
          ...updatedRole,
          permissions: newPermissions || updatedRole.permissions,
          updatedAt: new Date().toISOString()
        };
      }
      return role;
    });

    setRoles(updatedRoles);

    toast({
      title: "Role updated successfully",
      description: `The role "${updatedRole.name}" has been updated`,
      variant: "success",
    });
    
    return true;
  };

  const handleDeleteRole = (roleToDelete: Role) => {
    if (!roleToDelete) return false;

    if (roleToDelete.isDefault) {
      toast({
        title: "Cannot delete default role",
        description: "Default roles cannot be deleted",
        variant: "destructive",
      });
      return false;
    }

    setRoles(roles.filter(role => role.id !== roleToDelete.id));

    toast({
      title: "Role deleted successfully",
      description: `The role "${roleToDelete.name}" has been deleted`,
      variant: "success",
    });
    
    return true;
  };

  const handleDuplicateRole = (roleToDuplicate: Role) => {
    if (!roleToDuplicate) return false;
    
    // Create a copy with a new name and ID
    const duplicateName = `${roleToDuplicate.name} (Copy)`;
    
    // Check if a role with this name already exists
    if (roles.some(role => role.name.toLowerCase() === duplicateName.toLowerCase())) {
      toast({
        title: "Duplicate name exists",
        description: `A role named "${duplicateName}" already exists`,
        variant: "destructive",
      });
      return false;
    }
    
    const duplicateRole: Role = {
      id: `role-${uuidv4()}`,
      name: duplicateName,
      description: roleToDuplicate.description,
      isDefault: false, // Duplicated roles are never default
      permissions: {...roleToDuplicate.permissions},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setRoles([...roles, duplicateRole]);
    
    toast({
      title: "Role duplicated successfully",
      description: `Created new role "${duplicateName}" based on "${roleToDuplicate.name}"`,
      variant: "success",
    });
    
    return true;
  };

  const handleImportRoles = (importedRoles: Role[]) => {
    const validation = validateImportedRoles(importedRoles);
    
    if (!validation.valid) {
      toast({
        title: "Import failed",
        description: validation.message || "Invalid role data",
        variant: "destructive",
      });
      return false;
    }

    const defaultRoleIds = roles.filter(role => role.isDefault).map(role => role.id);
    const customImportedRoles = importedRoles.filter(role => !defaultRoleIds.includes(role.id));
    
    const existingRoleNames = new Set(roles.map(role => role.name.toLowerCase()));
    const duplicates = customImportedRoles.filter(role => 
      existingRoleNames.has(role.name.toLowerCase())
    );
    
    if (duplicates.length > 0) {
      const nonDuplicates = customImportedRoles.filter(
        role => !existingRoleNames.has(role.name.toLowerCase())
      );
      
      setRoles([...roles, ...nonDuplicates]);
      
      toast({
        title: "Roles imported with warnings",
        description: `Imported ${nonDuplicates.length} roles. ${duplicates.length} roles were skipped due to name conflicts.`,
        variant: "warning",
      });
    } else {
      setRoles([...roles, ...customImportedRoles]);
      
      toast({
        title: "Roles imported successfully",
        description: `Imported ${customImportedRoles.length} roles`,
        variant: "success",
      });
    }
    
    return true;
  };

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
