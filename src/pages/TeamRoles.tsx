
import { useState, useEffect } from "react";
import { Role } from "@/types/team";
import { PermissionSet } from "@/types/permissions";
import { permissionPresets } from "@/data/permissionPresets";
import { RolesPageHeader } from "@/components/team/roles/RolesPageHeader";
import { RolesGrid } from "@/components/team/roles/RolesGrid";
import { RolesSearch } from "@/components/team/roles/RolesSearch";
import { AddRoleDialog } from "@/components/team/roles/AddRoleDialog";
import { EditRoleDialog } from "@/components/team/roles/EditRoleDialog";
import { DeleteRoleDialog } from "@/components/team/roles/DeleteRoleDialog";
import { exportRolesToJson } from "@/utils/roleUtils";
import { useRoleManagement } from "@/hooks/useRoleManagement";
import { Card } from "@/components/ui/card";
import { ResponsiveContainer } from "@/components/ui/responsive-container";
import { toast } from "@/hooks/use-toast";

const initialRoles: Role[] = [
  {
    id: "role-1",
    name: "Owner",
    description: "Full access to all system features and settings",
    isDefault: true,
    permissions: permissionPresets.Owner,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    priority: 1
  },
  {
    id: "role-2",
    name: "Administrator",
    description: "Administrative access to most system features",
    isDefault: true,
    permissions: permissionPresets.Administrator,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    priority: 2
  },
  {
    id: "role-3",
    name: "Technician",
    description: "Access to work orders and relevant customer information",
    isDefault: true,
    permissions: permissionPresets.Technician,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    priority: 3
  },
  {
    id: "role-4",
    name: "Customer Service",
    description: "Access to customer information and basic work order management",
    isDefault: true,
    permissions: permissionPresets["Customer Service"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    priority: 4
  }
];

export default function TeamRoles() {
  const {
    filteredRoles,
    searchQuery,
    setSearchQuery,
    typeFilter,
    setTypeFilter,
    handleAddRole,
    handleEditRole,
    handleDeleteRole,
    handleDuplicateRole,
    handleImportRoles,
    handleReorderRole
  } = useRoleManagement(initialRoles);

  // Dialog state
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Form state
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDescription, setNewRoleDescription] = useState("");
  const [currentRole, setCurrentRole] = useState<Role | null>(null);
  const [rolePermissions, setRolePermissions] = useState<PermissionSet | null>(null);

  const handleExportRoles = () => {
    exportRolesToJson(initialRoles);
    toast({
      title: "Roles Exported",
      description: "Your roles have been exported to a JSON file",
    });
  };

  const onAddRole = () => {
    const success = handleAddRole(newRoleName, newRoleDescription, rolePermissions);
    if (success) {
      setIsAddDialogOpen(false);
      setNewRoleName("");
      setNewRoleDescription("");
      setRolePermissions(null);
      toast({
        title: "Role Added",
        description: "The new role has been created successfully",
        variant: "success",
      });
    }
  };

  const onEditRole = () => {
    if (!currentRole) return;
    
    const success = handleEditRole(currentRole, rolePermissions);
    if (success) {
      setIsEditDialogOpen(false);
      setCurrentRole(null);
      setRolePermissions(null);
      toast({
        title: "Role Updated",
        description: "The role has been updated successfully",
        variant: "success",
      });
    }
  };

  const onDeleteRole = () => {
    if (!currentRole) return;
    
    const success = handleDeleteRole(currentRole);
    if (success) {
      setIsDeleteDialogOpen(false);
      setCurrentRole(null);
      toast({
        title: "Role Deleted",
        description: "The role has been deleted successfully",
        variant: "success",
      });
    }
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
    <ResponsiveContainer maxWidth="full" className="space-y-6">
      <Card className="border-0 shadow-sm bg-white overflow-hidden">
        <RolesPageHeader 
          onAddRoleClick={() => setIsAddDialogOpen(true)}
          onExportRoles={handleExportRoles}
          onImportRoles={handleImportRoles}
        />
      </Card>

      <Card className="p-6 border shadow-sm bg-white">
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
          onDuplicateRole={(role) => {
            handleDuplicateRole(role);
            toast({
              title: "Role Duplicated",
              description: `A copy of "${role.name}" has been created`,
              variant: "success",
            });
          }}
          onReorderRole={handleReorderRole}
        />
      </Card>

      <AddRoleDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        roleName={newRoleName}
        onRoleNameChange={setNewRoleName}
        roleDescription={newRoleDescription}
        onRoleDescriptionChange={setNewRoleDescription}
        onPermissionsChange={(permissions) => setRolePermissions(permissions)}
        onAddRole={onAddRole}
      />

      <EditRoleDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        currentRole={currentRole}
        onCurrentRoleChange={setCurrentRole}
        rolePermissions={rolePermissions}
        onPermissionsChange={(permissions) => setRolePermissions(permissions)}
        onEditRole={onEditRole}
      />

      <DeleteRoleDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        currentRole={currentRole}
        onDeleteRole={onDeleteRole}
      />
    </ResponsiveContainer>
  );
}
