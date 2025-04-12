
import { useState } from "react";
import { Search, Filter, Calendar, RefreshCw, SlidersHorizontal, Download, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { statusMap } from "@/utils/workOrders";
import { useIsMobile } from "@/hooks/use-mobile";
import { WorkOrdersExportMenu } from "./WorkOrdersExportMenu";

interface WorkOrderFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: string[];
  setStatusFilter: (statuses: string[]) => void;
  selectedTechnician: string;
  setSelectedTechnician: (tech: string) => void;
  technicians: string[];
  resetFilters: () => void;
}

export default function WorkOrderFilters({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  selectedTechnician,
  setSelectedTechnician,
  technicians,
  resetFilters,
}: WorkOrderFiltersProps) {
  const isMobile = useIsMobile();
  const [filtersVisible, setFiltersVisible] = useState(!isMobile);

  return (
    <div className="space-y-4">
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <Input
          type="search"
          placeholder="Search work orders..."
          className="pl-10 w-full"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {isMobile && (
          <Button 
            variant="outline" 
            size="sm" 
            className="absolute right-2 top-1/2 -translate-y-1/2"
            onClick={() => setFiltersVisible(!filtersVisible)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        )}
      </div>

      {filtersVisible && (
        <div className="flex flex-wrap gap-3">
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
              {Object.entries(statusMap).map(([key, value]) => (
                <DropdownMenuCheckboxItem
                  key={key}
                  checked={statusFilter.includes(key)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setStatusFilter([...statusFilter, key]);
                    } else {
                      setStatusFilter(statusFilter.filter((s) => s !== key));
                    }
                  }}
                >
                  {String(value)}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Select
            value={selectedTechnician}
            onValueChange={setSelectedTechnician}
          >
            <SelectTrigger className={isMobile ? "w-full" : "w-[180px]"}>
              <SelectValue placeholder="All Technicians" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Technicians</SelectItem>
              {technicians.map((tech) => (
                <SelectItem key={tech} value={tech}>
                  {tech}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {!isMobile && (
            <Button variant="outline" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Date Range
            </Button>
          )}

          <Button variant="outline" className="flex items-center gap-2" onClick={resetFilters}>
            <RefreshCw className="h-4 w-4" />
            Reset
          </Button>

          {!isMobile && (
            <>
              <Button variant="outline" className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                More Filters
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
