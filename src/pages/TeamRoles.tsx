
import { SeoHead } from "@/components/common/SeoHead";
import { RolesPageHeader } from "@/components/team/roles/RolesPageHeader";
import { RolesContent } from "@/components/team/roles/RolesContent";
import { useTeamRolesPage } from "@/hooks/useTeamRolesPage";

export default function TeamRoles() {
  const {
    roles,
    filteredRoles,
    searchQuery,
    setSearchQuery,
    typeFilter,
    setTypeFilter,
    handleAddRole,
    handleEditRole,
    handleDeleteRole,
    handleDuplicateRole
  } = useTeamRolesPage();
  
  return (
    <div className="space-y-6">
      <SeoHead
        title="Role Management | Easy Shop Manager"
        description="Manage team roles and permissions for your organization."
        keywords="role management, permissions, access control"
      />
      
      <RolesPageHeader onAddRole={handleAddRole} />
      
      <RolesContent 
        roles={roles}
        filteredRoles={filteredRoles}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        onEditRole={handleEditRole}
        onDeleteRole={handleDeleteRole}
        onDuplicateRole={handleDuplicateRole}
      />
    </div>
  );
}
