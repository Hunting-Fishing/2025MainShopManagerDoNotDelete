
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Filter, RefreshCw, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TeamFiltersProps {
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

export function TeamFilters({
  roles,
  departments,
  statuses,
  roleFilter,
  departmentFilter,
  statusFilter,
  onRoleFilterChange,
  onDepartmentFilterChange,
  onStatusFilterChange,
  onResetFilters,
}: TeamFiltersProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Role
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuLabel>Filter by Role</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {roles.map((role) => (
            <DropdownMenuCheckboxItem
              key={role}
              checked={roleFilter.includes(role)}
              onCheckedChange={(checked) => {
                if (checked) {
                  onRoleFilterChange([...roleFilter, role]);
                } else {
                  onRoleFilterChange(roleFilter.filter((r) => r !== role));
                }
              }}
            >
              {role}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Department
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Filter by Department</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {departments.map((department) => (
            <DropdownMenuCheckboxItem
              key={department}
              checked={departmentFilter.includes(department)}
              onCheckedChange={(checked) => {
                if (checked) {
                  onDepartmentFilterChange([...departmentFilter, department]);
                } else {
                  onDepartmentFilterChange(departmentFilter.filter((d) => d !== department));
                }
              }}
            >
              {department}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Status
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {statuses.map((status) => (
            <DropdownMenuCheckboxItem
              key={status}
              checked={statusFilter.includes(status)}
              onCheckedChange={(checked) => {
                if (checked) {
                  onStatusFilterChange([...statusFilter, status]);
                } else {
                  onStatusFilterChange(statusFilter.filter((s) => s !== status));
                }
              }}
            >
              {status}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Button variant="outline" className="flex items-center gap-2" onClick={onResetFilters}>
        <RefreshCw className="h-4 w-4" />
        Reset
      </Button>
    </div>
  );
}
