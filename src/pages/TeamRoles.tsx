import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { Role } from "@/types/team";
import { PermissionSet } from "@/types/permissions";
import { permissionPresets } from "@/data/permissionPresets";
import { v4 as uuidv4 } from "uuid";
import { RolesPageHeader } from "@/components/team/roles/RolesPageHeader";
import { RolesGrid } from "@/components/team/roles/RolesGrid";
import { RolesSearch } from "@/components/team/roles/RolesSearch";
import { AddRoleDialog } from "@/components/team/roles/AddRoleDialog";
import { EditRoleDialog } from "@/components/team/roles/EditRoleDialog";
import { DeleteRoleDialog } from "@/components/team/roles/DeleteRoleDialog";
import { exportRolesToJson, validateImportedRoles } from "@/utils/roleUtils";

const initialRoles: Role[] = [
  {
    id: "role-1",
    name: "Owner",
    description: "Full access to all system features and settings",
    isDefault: true,
    permissions: permissionPresets.Owner,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "role-2",
    name: "Administrator",
    description: "Administrative access to most system features",
    isDefault: true,
    permissions: permissionPresets.Administrator,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "role-3",
    name: "Technician",
    description: "Access to work orders and relevant customer information",
    isDefault: true,
    permissions: permissionPresets.Technician,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "role-4",
    name: "Customer Service",
    description: "Access to customer information and basic work order management",
    isDefault: true,
    permissions: permissionPresets["Customer Service"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export default function TeamRoles() {
  const [roles, setRoles] = useState<Role[]>(initialRoles);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDescription, setNewRoleDescription] = useState("");
  const [currentRole, setCurrentRole] = useState<Role | null>(null);
  const [rolePermissions, setRolePermissions] = useState<PermissionSet | null>(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const filteredRoles = roles.filter(role => {
    const matchesSearch = role.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (typeFilter === "all") return matchesSearch;
    if (typeFilter === "default") return matchesSearch && role.isDefault;
    if (typeFilter === "custom") return matchesSearch && !role.isDefault;
    
    return matchesSearch;
  });

  const handleExportRoles = () => {
    exportRolesToJson(roles);
    toast({
      title: "Roles exported successfully",
      description: "All roles have been exported to a JSON file",
      variant: "success",
    });
  };

  const handleImportRoles = (importedRoles: Role[]) => {
    const validation = validateImportedRoles(importedRoles);
    
    if (!validation.valid) {
      toast({
        title: "Import failed",
        description: validation.message || "Invalid role data",
        variant: "destructive",
      });
      return;
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
  };

  const handleAddRole = () => {
    if (!newRoleName.trim()) {
      toast({
        title: "Role name required",
        description: "Please provide a name for the new role",
        variant: "destructive",
      });
      return;
    }

    if (roles.some(role => role.name.toLowerCase() === newRoleName.toLowerCase())) {
      toast({
        title: "Role already exists",
        description: "A role with this name already exists",
        variant: "destructive",
      });
      return;
    }

    const newRole: Role = {
      id: `role-${uuidv4()}`,
      name: newRoleName,
      description: newRoleDescription,
      isDefault: false,
      permissions: rolePermissions || permissionPresets.Technician,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setRoles([...roles, newRole]);
    setIsAddDialogOpen(false);
    setNewRoleName("");
    setNewRoleDescription("");
    setRolePermissions(null);

    toast({
      title: "Role created successfully",
      description: `The role "${newRoleName}" has been created`,
      variant: "success",
    });
  };

  const handleEditRole = () => {
    if (!currentRole) return;

    const updatedRoles = roles.map(role => {
      if (role.id === currentRole.id) {
        return {
          ...currentRole,
          permissions: rolePermissions || currentRole.permissions,
          updatedAt: new Date().toISOString()
        };
      }
      return role;
    });

    setRoles(updatedRoles);
    setIsEditDialogOpen(false);
    setCurrentRole(null);
    setRolePermissions(null);

    toast({
      title: "Role updated successfully",
      description: `The role "${currentRole.name}" has been updated`,
      variant: "success",
    });
  };

  const handleDeleteRole = () => {
    if (!currentRole) return;

    if (currentRole.isDefault) {
      toast({
        title: "Cannot delete default role",
        description: "Default roles cannot be deleted",
        variant: "destructive",
      });
      return;
    }

    setRoles(roles.filter(role => role.id !== currentRole.id));
    setIsDeleteDialogOpen(false);
    setCurrentRole(null);

    toast({
      title: "Role deleted successfully",
      description: `The role "${currentRole.name}" has been deleted`,
      variant: "success",
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

  return (
    <div className="space-y-6">
      <RolesPageHeader 
        onAddRoleClick={() => setIsAddDialogOpen(true)}
        onExportRoles={handleExportRoles}
        onImportRoles={handleImportRoles}
      />

      <RolesSearch 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
      />

      <RolesGrid 
        roles={filteredRoles} 
        onEditRole={(role) => {
          setCurrentRole(role);
          setRolePermissions(role.permissions as PermissionSet);
          setIsEditDialogOpen(true);
        }}
        onDeleteRole={(role) => {
          setCurrentRole(role);
          setIsDeleteDialogOpen(true);
        }}
      />

      <AddRoleDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        roleName={newRoleName}
        onRoleNameChange={setNewRoleName}
        roleDescription={newRoleDescription}
        onRoleDescriptionChange={setNewRoleDescription}
        onPermissionsChange={(permissions) => setRolePermissions(permissions)}
        onAddRole={handleAddRole}
      />

      <EditRoleDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        currentRole={currentRole}
        onCurrentRoleChange={setCurrentRole}
        rolePermissions={rolePermissions}
        onPermissionsChange={(permissions) => setRolePermissions(permissions)}
        onEditRole={handleEditRole}
      />

      <DeleteRoleDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        currentRole={currentRole}
        onDeleteRole={handleDeleteRole}
      />
    </div>
  );
}
