
import { useState } from "react";
import { SeoHead } from "@/components/common/SeoHead";
import { RolesPageHeader } from "@/components/team/roles/RolesPageHeader";
import { RolesContent } from "@/components/team/roles/RolesContent";
import { useTeamRolesPage } from "@/hooks/useTeamRolesPage";
import { Role } from "@/types/team";
import { PermissionSet } from "@/types/permissions";
import { defaultPermissions } from "@/data/permissionPresets";
import { AddRoleDialog } from "@/components/team/roles/AddRoleDialog";
import { EditRoleDialog } from "@/components/team/roles/EditRoleDialog";
import { DeleteRoleDialog } from "@/components/team/roles/DeleteRoleDialog";

export default function TeamRoles() {
  const {
    roles,
    filteredRoles,
    searchQuery,
    setSearchQuery,
    typeFilter,
    setTypeFilter,
    handleAddRole: addRole,
    handleEditRole: editRole,
    handleDeleteRole: deleteRole,
    handleDuplicateRole: duplicateRole
  } = useTeamRolesPage();
  
  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // Role form states
  const [roleName, setRoleName] = useState("");
  const [roleDescription, setRoleDescription] = useState("");
  const [rolePermissions, setRolePermissions] = useState<PermissionSet>(defaultPermissions);
  const [currentRole, setCurrentRole] = useState<Role | null>(null);
  
  const handleAddRoleClick = () => {
    setRoleName("");
    setRoleDescription("");
    setRolePermissions(defaultPermissions);
    setAddDialogOpen(true);
  };
  
  const handleEditRole = (role: Role) => {
    setCurrentRole(role);
    setEditDialogOpen(true);
  };
  
  const handleDeleteRole = (role: Role) => {
    setCurrentRole(role);
    setDeleteDialogOpen(true);
  };
  
  const handlePermissionsChange = (permissions: PermissionSet) => {
    setRolePermissions(permissions);
  };
  
  const handleAddRoleSubmit = () => {
    if (addRole(roleName, roleDescription, rolePermissions)) {
      setAddDialogOpen(false);
    }
  };
  
  const handleEditRoleSubmit = () => {
    if (currentRole && editRole(currentRole, rolePermissions)) {
      setEditDialogOpen(false);
    }
  };
  
  const handleDeleteRoleSubmit = () => {
    if (currentRole && deleteRole(currentRole)) {
      setDeleteDialogOpen(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <SeoHead
        title="Role Management | Easy Shop Manager"
        description="Manage team roles and permissions for your organization."
        keywords="role management, permissions, access control"
      />
      
      <RolesPageHeader onAddRoleClick={handleAddRoleClick} />
      
      <RolesContent 
        roles={roles}
        filteredRoles={filteredRoles}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        onEditRole={handleEditRole}
        onDeleteRole={handleDeleteRole}
        onDuplicateRole={duplicateRole}
      />
      
      <AddRoleDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        roleName={roleName}
        onRoleNameChange={setRoleName}
        roleDescription={roleDescription}
        onRoleDescriptionChange={setRoleDescription}
        onPermissionsChange={handlePermissionsChange}
        onAddRole={handleAddRoleSubmit}
      />
      
      <EditRoleDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        currentRole={currentRole}
        onCurrentRoleChange={setCurrentRole}
        rolePermissions={rolePermissions}
        onPermissionsChange={handlePermissionsChange}
        onEditRole={handleEditRoleSubmit}
      />
      
      <DeleteRoleDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        currentRole={currentRole}
        onDeleteRole={handleDeleteRoleSubmit}
      />
    </div>
  );
}
