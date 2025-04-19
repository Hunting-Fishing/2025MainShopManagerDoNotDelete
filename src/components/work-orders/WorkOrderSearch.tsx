
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuTrigger, 
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuCheckboxItem
} from "@/components/ui/dropdown-menu";
import { CheckSquare, Filter, Search } from "lucide-react";
import { statusMap, priorityMap } from "@/utils/workOrders";

export interface WorkOrderSearchProps {
  technicians: string[];
  onSearch: (term: string) => void;
  onStatusFilterChange: (statuses: string[]) => void;
  onPriorityFilterChange: (priorities: string[]) => void;
  onTechnicianFilterChange: (technicians: string[]) => void;
}

export function WorkOrderSearch({ 
  technicians = [], 
  onSearch,
  onStatusFilterChange,
  onPriorityFilterChange,
  onTechnicianFilterChange
}: WorkOrderSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
  const [selectedTechnicians, setSelectedTechnicians] = useState<string[]>([]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = () => {
    onSearch(searchTerm);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearchSubmit();
    }
  };

  const handleStatusToggle = (status: string) => {
    setSelectedStatuses(prev => {
      const newSelection = prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status];
      
      onStatusFilterChange(newSelection);
      return newSelection;
    });
  };

  const handlePriorityToggle = (priority: string) => {
    setSelectedPriorities(prev => {
      const newSelection = prev.includes(priority)
        ? prev.filter(p => p !== priority)
        : [...prev, priority];
      
      onPriorityFilterChange(newSelection);
      return newSelection;
    });
  };

  const handleTechnicianToggle = (technician: string) => {
    setSelectedTechnicians(prev => {
      const newSelection = prev.includes(technician)
        ? prev.filter(t => t !== technician)
        : [...prev, technician];
      
      onTechnicianFilterChange(newSelection);
      return newSelection;
    });
  };

  return (
    <div className="flex flex-col md:flex-row gap-2">
      <div className="relative flex-1">
        <Input
          placeholder="Search work orders..."
          value={searchTerm}
          onChange={handleSearchChange}
          onKeyDown={handleKeyDown}
          className="pr-10"
        />
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-0 top-0 h-full"
          onClick={handleSearchSubmit}
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            <span className="hidden md:inline">Filters</span>
            {(selectedStatuses.length > 0 || selectedPriorities.length > 0 || selectedTechnicians.length > 0) && (
              <span className="inline-flex items-center justify-center h-5 w-5 text-xs font-medium bg-primary text-primary-foreground rounded-full">
                {selectedStatuses.length + selectedPriorities.length + selectedTechnicians.length}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>Status</DropdownMenuLabel>
          {Object.entries(statusMap).map(([key, value]) => (
            <DropdownMenuCheckboxItem
              key={key}
              checked={selectedStatuses.includes(key)}
              onCheckedChange={() => handleStatusToggle(key)}
            >
              {value}
            </DropdownMenuCheckboxItem>
          ))}

          <DropdownMenuSeparator />
          <DropdownMenuLabel>Priority</DropdownMenuLabel>
          {Object.entries(priorityMap).map(([key, value]) => (
            <DropdownMenuCheckboxItem
              key={key}
              checked={selectedPriorities.includes(key)}
              onCheckedChange={() => handlePriorityToggle(key)}
            >
              {value.label}
            </DropdownMenuCheckboxItem>
          ))}

          {technicians.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Technician</DropdownMenuLabel>
              {technicians.map((technician) => (
                <DropdownMenuCheckboxItem
                  key={technician}
                  checked={selectedTechnicians.includes(technician)}
                  onCheckedChange={() => handleTechnicianToggle(technician)}
                >
                  {technician}
                </DropdownMenuCheckboxItem>
              ))}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
