
import { useState } from "react";
import { TeamHeader } from "@/components/team/TeamHeader";
import { TeamSearch } from "@/components/team/TeamSearch";
import { TeamFilters } from "@/components/team/TeamFilters";
import { TeamViewToggle } from "@/components/team/TeamViewToggle";
import { TeamMemberGrid } from "@/components/team/TeamMemberGrid";
import { TeamMemberTable } from "@/components/team/TeamMemberTable";
import { getInitials } from "@/data/teamData";
import { useTeamMembers } from "@/hooks/useTeamMembers";

export default function Team() {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string[]>([]);
  const [departmentFilter, setDepartmentFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [view, setView] = useState<"grid" | "list">("grid");
  
  // Use our hook to get team members data from Supabase
  const { teamMembers, isLoading, error } = useTeamMembers();

  // Log all roles for debugging
  console.log("All available roles:", teamMembers.map(member => member.role));

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

  return (
    <div className="space-y-6">
      <TeamHeader />

      {/* Filters and search */}
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

      {/* View toggle */}
      <TeamViewToggle 
        view={view} 
        onViewChange={setView} 
      />

      {error && (
        <div className="p-4 border border-red-300 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {/* Loading state */}
      {isLoading ? (
        <div className="flex justify-center items-center p-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      ) : (
        /* Display team members in either grid or table view */
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
          <p className="text-slate-500">No team members found. {teamMembers.length > 0 ? "Try adjusting your filters." : ""}</p>
        </div>
      )}
    </div>
  );
}
