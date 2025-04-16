
import React from "react";
import { Search, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface HistoryFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  actionTypeFilter: string;
  onActionTypeFilterChange: (value: string) => void;
  onRefresh: () => void;
}

export function HistoryFilters({
  searchTerm,
  onSearchChange,
  actionTypeFilter,
  onActionTypeFilterChange,
  onRefresh
}: HistoryFiltersProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center mt-4 md:mt-0">
      <div className="relative w-full sm:w-64">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search history..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      
      <Select value={actionTypeFilter} onValueChange={onActionTypeFilterChange}>
        <SelectTrigger className="w-full sm:w-40">
          <SelectValue placeholder="Filter by action" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Actions</SelectItem>
          <SelectItem value="creation">Creation</SelectItem>
          <SelectItem value="update">Update</SelectItem>
          <SelectItem value="deletion">Deletion</SelectItem>
          <SelectItem value="role_change">Role Change</SelectItem>
          <SelectItem value="status_change">Status Change</SelectItem>
        </SelectContent>
      </Select>
      
      <Button variant="outline" size="icon" onClick={onRefresh} title="Refresh">
        <RefreshCw className="h-4 w-4" />
      </Button>
    </div>
  );
}
