
import { useState } from "react";
import { Role } from "@/types/team";
import { PermissionSet } from "@/types/permissions";
import { toast } from "sonner";

export function useRoleActions(initialRoles: Role[], setRoles: (roles: Role[]) => void) {
  const handleAddRole = (name: string, description: string, permissions: PermissionSet): boolean => {
    if (!name.trim()) {
      toast.error("Role name cannot be empty");
      return false;
    }
    
    // Check for duplicate names
    if (initialRoles.some(role => role.name.toLowerCase() === name.toLowerCase())) {
      toast.error("A role with this name already exists");
      return false;
    }
    
    const newRole: Role = {
      id: crypto.randomUUID(),
      name,
      description,
      isDefault: false,
      permissions,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      priority: initialRoles.length + 1
    };
    
    setRoles([...initialRoles, newRole]);
    toast.success(`Role "${name}" has been created`);
    return true;
  };
  
  const handleEditRole = (updatedRole: Role, newPermissions: PermissionSet | null): boolean => {
    // Don't allow changing default role names
    if (updatedRole.isDefault && initialRoles.find(r => r.id === updatedRole.id)?.name !== updatedRole.name) {
      toast.error("Default role names cannot be modified");
      return false;
    }
    
    const roleWithUpdatedPermissions = {
      ...updatedRole,
      permissions: newPermissions || updatedRole.permissions,
      updatedAt: new Date().toISOString()
    };
    
    setRoles(
      initialRoles.map(role => (role.id === updatedRole.id ? roleWithUpdatedPermissions : role))
    );
    
    toast.success(`Role "${updatedRole.name}" has been updated`);
    return true;
  };
  
  const handleDeleteRole = (roleToDelete: Role): boolean => {
    if (roleToDelete.isDefault) {
      toast.error("Default roles cannot be deleted");
      return false;
    }
    
    setRoles(initialRoles.filter(role => role.id !== roleToDelete.id));
    toast.success(`Role "${roleToDelete.name}" has been deleted`);
    return true;
  };
  
  const handleDuplicateRole = (roleToDuplicate: Role): boolean => {
    const newRoleName = `${roleToDuplicate.name} (Copy)`;
    
    const duplicatedRole: Role = {
      ...roleToDuplicate,
      id: crypto.randomUUID(),
      name: newRoleName,
      isDefault: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      priority: initialRoles.length + 1
    };
    
    setRoles([...initialRoles, duplicatedRole]);
    toast.success(`Role "${roleToDuplicate.name}" has been duplicated`);
    return true;
  };
  
  const handleReorderRole = (roleId: string, newPriority: number) => {
    const role = initialRoles.find(r => r.id === roleId);
    if (!role) return;
    
    const updatedRoles = initialRoles.map(r => {
      if (r.id === roleId) {
        return { ...r, priority: newPriority };
      }
      return r;
    });
    
    setRoles(updatedRoles.sort((a, b) => a.priority - b.priority));
  };
  
  return {
    handleAddRole,
    handleEditRole,
    handleDeleteRole,
    handleDuplicateRole,
    handleReorderRole
  };
}
