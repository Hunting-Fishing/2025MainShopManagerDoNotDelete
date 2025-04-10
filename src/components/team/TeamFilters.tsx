
import { useState } from "react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Check, ChevronDown, Filter, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
  onResetFilters
}: TeamFiltersProps) {
  const [isRoleOpen, setIsRoleOpen] = useState(false);
  const [isDepartmentOpen, setIsDepartmentOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  
  const totalFilters = roleFilter.length + departmentFilter.length + statusFilter.length;
  
  const toggleRole = (role: string) => {
    if (roleFilter.includes(role)) {
      onRoleFilterChange(roleFilter.filter(r => r !== role));
    } else {
      onRoleFilterChange([...roleFilter, role]);
    }
  };
  
  const toggleDepartment = (department: string) => {
    if (departmentFilter.includes(department)) {
      onDepartmentFilterChange(departmentFilter.filter(d => d !== department));
    } else {
      onDepartmentFilterChange([...departmentFilter, department]);
    }
  };
  
  const toggleStatus = (status: string) => {
    if (statusFilter.includes(status)) {
      onStatusFilterChange(statusFilter.filter(s => s !== status));
    } else {
      onStatusFilterChange([...statusFilter, status]);
    }
  };
  
  return (
    <div className="flex items-center gap-2">
      {/* Role filter */}
      <DropdownMenu open={isRoleOpen} onOpenChange={setIsRoleOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-9 border-slate-200 text-slate-600">
            Role
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 p-2">
          <div className="space-y-1">
            {roles.map((role) => (
              <div
                key={role}
                onClick={() => toggleRole(role)}
                className="flex items-center rounded-md px-2 py-1.5 text-sm hover:bg-slate-100 cursor-pointer"
              >
                <div className="flex items-center justify-center w-5 h-5 mr-2 rounded border border-slate-200">
                  {roleFilter.includes(role) && <Check className="h-3 w-3" />}
                </div>
                <span className="flex-grow">{role}</span>
              </div>
            ))}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* Department filter */}
      <DropdownMenu open={isDepartmentOpen} onOpenChange={setIsDepartmentOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-9 border-slate-200 text-slate-600">
            Department
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 p-2">
          <div className="space-y-1">
            {departments.map((department) => (
              <div
                key={department}
                onClick={() => toggleDepartment(department)}
                className="flex items-center rounded-md px-2 py-1.5 text-sm hover:bg-slate-100 cursor-pointer"
              >
                <div className="flex items-center justify-center w-5 h-5 mr-2 rounded border border-slate-200">
                  {departmentFilter.includes(department) && <Check className="h-3 w-3" />}
                </div>
                <span className="flex-grow">{department}</span>
              </div>
            ))}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* Status filter */}
      <DropdownMenu open={isStatusOpen} onOpenChange={setIsStatusOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-9 border-slate-200 text-slate-600">
            Status
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 p-2">
          <div className="space-y-1">
            {statuses.map((status) => (
              <div
                key={status}
                onClick={() => toggleStatus(status)}
                className="flex items-center rounded-md px-2 py-1.5 text-sm hover:bg-slate-100 cursor-pointer"
              >
                <div className="flex items-center justify-center w-5 h-5 mr-2 rounded border border-slate-200">
                  {statusFilter.includes(status) && <Check className="h-3 w-3" />}
                </div>
                <span className="flex-grow">{status}</span>
              </div>
            ))}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* Active filters */}
      {totalFilters > 0 && (
        <div className="flex items-center gap-1.5">
          <Badge className="bg-slate-200 text-slate-600 hover:bg-slate-300">
            {totalFilters} {totalFilters === 1 ? "filter" : "filters"}
          </Badge>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-9 px-2"
            onClick={onResetFilters}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Clear filters</span>
          </Button>
        </div>
      )}
    </div>
  );
}
