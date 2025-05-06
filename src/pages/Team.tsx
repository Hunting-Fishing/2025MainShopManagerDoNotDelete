
import { useState } from "react";
import { SeoHead } from "@/components/common/SeoHead";
import { TeamHeader } from "@/components/team/TeamHeader";
import { TeamViewToggle } from "@/components/team/TeamViewToggle";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import { useAuthUser } from "@/hooks/useAuthUser";
import { TeamOwnerAlert } from "@/components/team/TeamOwnerAlert";
import { TeamError } from "@/components/team/TeamError";
import { TeamContent } from "@/components/team/TeamContent";
import { TeamFilterToolbar } from "@/components/team/TeamFilterToolbar";
import { useTeamFilters } from "@/hooks/useTeamFilters";
import { TeamLoading } from "@/components/team/TeamLoading";
import { useToast } from "@/components/ui/use-toast";

export default function Team() {
  const [view, setView] = useState<"grid" | "list">("grid");
  const { toast } = useToast();
  
  // Get current user
  const { userId, isLoading: authLoading } = useAuthUser();
  
  // Use our hook to get team members data from Supabase
  const { teamMembers, isLoading, error: fetchError } = useTeamMembers();
  
  // Use custom hook for filtering
  const {
    searchQuery,
    setSearchQuery,
    roleFilter,
    setRoleFilter,
    departmentFilter,
    setDepartmentFilter,
    statusFilter,
    setStatusFilter,
    roles,
    departments,
    statuses,
    filteredMembers,
    resetFilters
  } = useTeamFilters(teamMembers);
  
  // Check if the current user has no role or should be an owner
  const currentUser = userId ? teamMembers.find(member => member.id === userId) : null;
  const currentUserHasNoRole = currentUser && (currentUser.role === "No Role Assigned" || currentUser.role !== "Owner");
  
  // Log current user role info for debugging
  if (currentUser) {
    console.log("Current user:", currentUser);
    console.log("Current user role:", currentUser.role);
  }

  // Helper function to get initials from name
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2);
  };

  // Main rendering logic with error handling
  if (authLoading || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <TeamLoading />
      </div>
    );
  }

  if (fetchError) {
    toast({
      variant: "destructive",
      title: "Error loading team data",
      description: fetchError
    });
  }

  return (
    <div className="space-y-6">
      <SeoHead 
        title="Team Management | Easy Shop Manager" 
        description="Manage your team members, assign roles and permissions, and track their performance."
        keywords="team management, role assignment, technician management, staff management"
      />
      
      <TeamHeader />
      
      {fetchError && <TeamError error={fetchError} />}
      
      <TeamOwnerAlert userId={userId} hasNoRole={currentUserHasNoRole} />

      {!fetchError && (
        <>
          <TeamFilterToolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            roles={roles}
            departments={departments}
            statuses={statuses}
            roleFilter={roleFilter}
            departmentFilter={departmentFilter}
            statusFilter={statusFilter}
            onRoleFilterChange={setRoleFilter}
            onDepartmentFilterChange={setDepartmentFilter}
            onStatusFilterChange={setStatusFilter}
            onResetFilters={resetFilters}
          />

          <TeamViewToggle 
            view={view} 
            onViewChange={setView} 
          />

          <TeamContent
            members={filteredMembers}
            isLoading={isLoading}
            view={view}
            getInitials={getInitials}
          />
        </>
      )}
    </div>
  );
}
