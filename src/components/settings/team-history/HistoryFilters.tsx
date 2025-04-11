
import React from "react";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface HistoryFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  actionTypeFilter: string;
  onActionTypeFilterChange: (value: string) => void;
  onRefresh: () => void;
}

export const HistoryFilters = ({
  searchTerm,
  onSearchChange,
  actionTypeFilter,
  onActionTypeFilterChange,
  onRefresh
}: HistoryFiltersProps) => {
  return (
    <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mt-4 md:mt-0 w-full md:w-auto">
      <div className="w-full md:w-auto">
        <Input 
          placeholder="Search history..." 
          value={searchTerm}
          onChange={e => onSearchChange(e.target.value)}
          className="w-full md:w-auto"
        />
      </div>
      <div className="w-full md:w-auto">
        <Select value={actionTypeFilter} onValueChange={onActionTypeFilterChange}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            <SelectItem value="creation">Creation</SelectItem>
            <SelectItem value="update">Update</SelectItem>
            <SelectItem value="role_change">Role Change</SelectItem>
            <SelectItem value="status_change">Status Change</SelectItem>
            <SelectItem value="deletion">Deletion</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button 
        variant="outline" 
        onClick={onRefresh} 
        className="flex items-center gap-2"
      >
        <RefreshCw className="h-4 w-4" />
        Refresh
      </Button>
    </div>
  );
};
