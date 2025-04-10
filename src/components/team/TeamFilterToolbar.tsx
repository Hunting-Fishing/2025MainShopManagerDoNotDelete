
import { TeamSearch } from "./TeamSearch";
import { TeamFilters } from "./TeamFilters";

interface TeamFilterToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  roles: string[];
  departments: string[];
  statuses: string[];
  roleFilter: string[];
  departmentFilter: string[];
  statusFilter: string[];
  onRoleFilterChange: (roles: string[]) => void;
  onDepartmentFilterChange: (departments: string[]) => void;
  onStatusFilterChange: (statuses: string[]) => void;
  onResetFilters: () => void;
}

export function TeamFilterToolbar({
  searchQuery,
  onSearchChange,
  roles,
  departments,
  statuses,
  roleFilter,
  departmentFilter,
  statusFilter,
  onRoleFilterChange,
  onDepartmentFilterChange,
  onStatusFilterChange,
  onResetFilters
}: TeamFilterToolbarProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
      <TeamSearch 
        searchQuery={searchQuery} 
        onSearchChange={onSearchChange} 
      />
      <TeamFilters 
        roles={roles}
        departments={departments}
        statuses={statuses}
        roleFilter={roleFilter}
        departmentFilter={departmentFilter}
        statusFilter={statusFilter}
        onRoleFilterChange={onRoleFilterChange}
        onDepartmentFilterChange={onDepartmentFilterChange}
        onStatusFilterChange={onStatusFilterChange}
        onResetFilters={onResetFilters}
      />
    </div>
  );
}
