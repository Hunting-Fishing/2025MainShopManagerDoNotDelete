
import { Role } from "@/types/team";
import { PermissionSet } from "@/types/permissions";
import { toast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";

export function useRoleActions(roles: Role[], setRoles: React.Dispatch<React.SetStateAction<Role[]>>) {
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

  return {
    handleAddRole,
    handleEditRole,
    handleDeleteRole,
    handleDuplicateRole
  };
}
