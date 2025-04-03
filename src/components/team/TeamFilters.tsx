
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

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
  const totalFilters = roleFilter.length + departmentFilter.length + statusFilter.length;

  const toggleRoleFilter = (role: string) => {
    if (roleFilter.includes(role)) {
      onRoleFilterChange(roleFilter.filter(r => r !== role));
    } else {
      onRoleFilterChange([...roleFilter, role]);
    }
  };

  const toggleDepartmentFilter = (department: string) => {
    if (departmentFilter.includes(department)) {
      onDepartmentFilterChange(departmentFilter.filter(d => d !== department));
    } else {
      onDepartmentFilterChange([...departmentFilter, department]);
    }
  };

  const toggleStatusFilter = (status: string) => {
    if (statusFilter.includes(status)) {
      onStatusFilterChange(statusFilter.filter(s => s !== status));
    } else {
      onStatusFilterChange([...statusFilter, status]);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="relative">
          Filter
          {totalFilters > 0 && (
            <Badge className="ml-2 bg-esm-blue-600" variant="default">
              {totalFilters}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[260px]">
        <DropdownMenuGroup>
          <DropdownMenuItem className="font-medium" disabled>
            Filter by Role
          </DropdownMenuItem>
          <Separator className="my-1" />
          {roles.map((role) => (
            <DropdownMenuItem
              key={role}
              onClick={(e) => {
                e.preventDefault();
                toggleRoleFilter(role);
              }}
              className="flex items-center justify-between"
            >
              {role}
              {roleFilter.includes(role) && <X className="h-4 w-4 text-primary" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuGroup>
          <DropdownMenuItem className="font-medium" disabled>
            Filter by Department
          </DropdownMenuItem>
          <Separator className="my-1" />
          {departments.map((department) => (
            <DropdownMenuItem
              key={department}
              onClick={(e) => {
                e.preventDefault();
                toggleDepartmentFilter(department);
              }}
              className="flex items-center justify-between"
            >
              {department}
              {departmentFilter.includes(department) && <X className="h-4 w-4 text-primary" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuGroup>
          <DropdownMenuItem className="font-medium" disabled>
            Filter by Status
          </DropdownMenuItem>
          <Separator className="my-1" />
          {statuses.map((status) => (
            <DropdownMenuItem
              key={status}
              onClick={(e) => {
                e.preventDefault();
                toggleStatusFilter(status);
              }}
              className="flex items-center justify-between"
            >
              {status}
              {statusFilter.includes(status) && <X className="h-4 w-4 text-primary" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator />
        
        {totalFilters > 0 && (
          <DropdownMenuItem 
            className="justify-center text-center font-medium text-destructive hover:text-destructive"
            onClick={(e) => {
              e.preventDefault();
              onResetFilters();
            }}
          >
            Clear all filters
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
