import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { TeamHeader } from "@/components/team/TeamHeader";
import { TeamSearch } from "@/components/team/TeamSearch";
import { TeamFilters } from "@/components/team/TeamFilters";
import { TeamViewToggle } from "@/components/team/TeamViewToggle";
import { TeamMemberGrid } from "@/components/team/TeamMemberGrid";
import { TeamMemberTable } from "@/components/team/TeamMemberTable";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import { useAuthUser } from "@/hooks/useAuthUser";
import { Button } from "@/components/ui/button";
import { assignRoleToUser, findRoleByName } from "@/utils/roleManagement";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { getInitials } from "@/utils/teamUtils";

export default function Team() {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string[]>([]);
  const [departmentFilter, setDepartmentFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [isAssigningRole, setIsAssigningRole] = useState(false);
  
  // Get current user
  const { userId, isLoading: authLoading } = useAuthUser();
  
  // Use our hook to get team members data from Supabase
  const { teamMembers, isLoading, error: fetchError } = useTeamMembers();

  // Get unique roles and departments for filters
  const roles = Array.from(new Set(teamMembers.map(member => member.role))).sort();
  const departments = Array.from(new Set(teamMembers.map(member => member.department))).sort();
  const statuses = Array.from(new Set(teamMembers.map(member => member.status))).sort();

  // Filter team members
  const filteredMembers = teamMembers.filter((member) => {
    const matchesSearch = 
      !searchQuery ||
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.jobTitle.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = 
      roleFilter.length === 0 || roleFilter.includes(member.role);
    
    const matchesDepartment = 
      departmentFilter.length === 0 || departmentFilter.includes(member.department);
    
    const matchesStatus = 
      statusFilter.length === 0 || statusFilter.includes(member.status);
    
    return matchesSearch && matchesRole && matchesDepartment && matchesStatus;
  });

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery("");
    setRoleFilter([]);
    setDepartmentFilter([]);
    setStatusFilter([]);
  };
  
  // Handle assigning the Owner role to the current user if they don't have a role
  const handleSelfAssignOwnerRole = async () => {
    if (!userId) {
      toast({
        title: "Not authenticated",
        description: "You need to be logged in to assign yourself a role.",
        variant: "destructive",
      });
      return;
    }
    
    setIsAssigningRole(true);
    try {
      // Find the owner role ID
      const { roleId, error: findError } = await findRoleByName("Owner");
      
      if (findError || !roleId) {
        console.error("Could not find Owner role:", findError);
        toast({
          title: "Error",
          description: "Could not find the Owner role. Please contact support.",
          variant: "destructive",
        });
        return;
      }
      
      // Assign the role
      const { success, message } = await assignRoleToUser(userId, roleId);
      
      if (success) {
        toast({
          title: "Role assigned",
          description: "You are now an Owner. The page will refresh in 3 seconds.",
        });
        // Refresh the page after a short delay to show the updated role
        setTimeout(() => window.location.reload(), 3000);
      } else {
        toast({
          title: "Error",
          description: message || "Failed to assign role. Please try again.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Error assigning role:", err);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAssigningRole(false);
    }
  };
  
  // Check if the current user has no role
  const currentUser = userId ? teamMembers.find(member => member.id === userId) : null;
  const currentUserHasNoRole = currentUser && currentUser.role === "No Role Assigned";

  // Main rendering logic with error handling
  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
        <p className="text-lg text-muted-foreground">Loading authentication data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Team Management</title>
        <meta 
          name="description" 
          content="Manage your team members, assign roles and permissions, and track their performance in Easy Shop Manager." 
        />
        <meta 
          name="keywords" 
          content="team management, role assignment, technician management, staff management" 
        />
      </Helmet>
      
      <TeamHeader />
      
      {fetchError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error loading team members</AlertTitle>
          <AlertDescription>
            {fetchError}. Please check your connection and try again.
          </AlertDescription>
        </Alert>
      )}
      
      {currentUserHasNoRole && (
        <Alert className="bg-yellow-50 border border-yellow-200">
          <AlertTitle className="text-yellow-800">You don't have a role assigned</AlertTitle>
          <AlertDescription className="text-yellow-700">
            As the first user of the system, you should assign yourself as the Owner.
            <div className="mt-4">
              <Button 
                onClick={handleSelfAssignOwnerRole}
                className="bg-yellow-600 hover:bg-yellow-700 text-white"
                disabled={isAssigningRole}
              >
                {isAssigningRole ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Assigning...
                  </>
                ) : "Make Me an Owner"}
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {!fetchError && (
        <>
          <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
            <TeamSearch 
              searchQuery={searchQuery} 
              onSearchChange={setSearchQuery} 
            />
            <TeamFilters 
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
          </div>

          <TeamViewToggle 
            view={view} 
            onViewChange={setView} 
          />

          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-12 bg-white rounded-lg border border-slate-200">
              <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
              <p className="text-slate-500">Loading team members...</p>
            </div>
          ) : (
            view === 'grid' ? (
              <TeamMemberGrid 
                members={filteredMembers} 
                getInitials={getInitials} 
              />
            ) : (
              <TeamMemberTable 
                members={filteredMembers} 
                getInitials={getInitials} 
              />
            )
          )}

          {!isLoading && filteredMembers.length === 0 && (
            <div className="p-6 text-center bg-white rounded-lg border border-slate-200">
              <p className="text-slate-500">
                {teamMembers.length > 0 
                  ? "No team members match your current filters. Try adjusting your search criteria."
                  : "No team members found. Add team members to get started."}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
