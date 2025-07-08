
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EnhancedDepartmentManager } from "./team/EnhancedDepartmentManager";
import { RolesContent } from "@/components/team/roles/RolesContent";
import { RoleDialogs } from "@/components/team/roles/RoleDialogs";
import { useTeamRolesPage } from "@/hooks/useTeamRolesPage";

export function TeamTab() {
  const {
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
    onAddRole,
    onEditRole,
    onDeleteRole,
    handleEditRoleClick,
    handleDeleteRoleClick,
    handleDuplicateRoleClick,
    handleReorderRole
  } = useTeamRolesPage();

  return (
    <Tabs defaultValue="departments">
      <TabsList className="mb-4">
        <TabsTrigger value="departments">Departments</TabsTrigger>
        <TabsTrigger value="roles">Roles</TabsTrigger>
      </TabsList>
      
      <TabsContent value="departments" className="space-y-4">
        <EnhancedDepartmentManager />
      </TabsContent>
      
      <TabsContent value="roles" className="space-y-4">
        <RolesContent 
          roles={filteredRoles}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
          onEditRole={handleEditRoleClick}
          onDeleteRole={handleDeleteRoleClick}
          onDuplicateRole={handleDuplicateRoleClick}
          onReorderRole={handleReorderRole}
        />

        <RoleDialogs 
          addDialogOpen={isAddDialogOpen}
          onAddDialogChange={setIsAddDialogOpen}
          roleName={newRoleName}
          onRoleNameChange={setNewRoleName}
          roleDescription={newRoleDescription}
          onRoleDescriptionChange={setNewRoleDescription}
          onPermissionsChange={setRolePermissions}
          onAddRole={onAddRole}
          
          editDialogOpen={isEditDialogOpen}
          onEditDialogChange={setIsEditDialogOpen}
          currentRole={currentRole}
          onCurrentRoleChange={setCurrentRole}
          rolePermissions={rolePermissions}
          onEditRole={onEditRole}
          
          deleteDialogOpen={isDeleteDialogOpen}
          onDeleteDialogChange={setIsDeleteDialogOpen}
          onDeleteRole={onDeleteRole}
        />
      </TabsContent>
    </Tabs>
  );
}
