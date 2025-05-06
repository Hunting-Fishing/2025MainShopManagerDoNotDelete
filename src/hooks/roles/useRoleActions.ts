
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
  
  const handleReorderRole = (roleId: string, direction: 'up' | 'down'): boolean => {
    const roleIndex = initialRoles.findIndex(r => r.id === roleId);
    if (roleIndex === -1) return false;
    
    const role = initialRoles[roleIndex];
    const sortedRoles = [...initialRoles].sort((a, b) => a.priority - b.priority);
    const sortedIndex = sortedRoles.findIndex(r => r.id === roleId);
    
    // Can't move the first role up or last role down
    if ((direction === 'up' && sortedIndex === 0) || 
        (direction === 'down' && sortedIndex === sortedRoles.length - 1)) {
      toast.error(`Cannot move role ${direction}`);
      return false;
    }
    
    // Find the adjacent role to swap with
    const adjacentIndex = direction === 'up' ? sortedIndex - 1 : sortedIndex + 1;
    const adjacentRole = sortedRoles[adjacentIndex];
    
    // Swap priorities
    const updatedRoles = initialRoles.map(r => {
      if (r.id === role.id) {
        return { ...r, priority: adjacentRole.priority };
      }
      if (r.id === adjacentRole.id) {
        return { ...r, priority: role.priority };
      }
      return r;
    });
    
    setRoles(updatedRoles);
    return true;
  };
  
  return {
    handleAddRole,
    handleEditRole,
    handleDeleteRole,
    handleDuplicateRole,
    handleReorderRole
  };
}
