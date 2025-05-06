
import { Role } from "@/types/team";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { RolesTable } from "./RolesTable";

interface RolesContentProps {
  roles: Role[];
  filteredRoles: Role[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  typeFilter: string;
  onTypeFilterChange: (filter: string) => void;
  onEditRole: (role: Role) => void;
  onDeleteRole: (role: Role) => void;
  onDuplicateRole: (role: Role) => void;
}

export function RolesContent({
  roles,
  filteredRoles,
  searchQuery,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  onEditRole,
  onDeleteRole,
  onDuplicateRole
}: RolesContentProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="w-full sm:w-2/3">
            <Input
              placeholder="Search roles..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="w-full sm:w-1/3">
            <Select value={typeFilter} onValueChange={onTypeFilterChange}>
              <SelectTrigger>
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="default">Default roles</SelectItem>
                <SelectItem value="custom">Custom roles</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <RolesTable
          roles={filteredRoles}
          onEditRole={onEditRole}
          onDeleteRole={onDeleteRole}
          onDuplicateRole={onDuplicateRole}
        />
      </CardContent>
    </Card>
  );
}
