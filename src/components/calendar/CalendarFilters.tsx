import { Filter, RefreshCw, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { getUniqueTechnicians } from "@/services/workOrder";
import { statusMap } from "@/types/workOrder";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { BusinessHoursInfo } from "./BusinessHoursInfo";

interface BusinessHour {
  day_of_week: number;
  open_time: string;
  close_time: string;
  is_closed: boolean;
}

interface CalendarFiltersProps {
  technicianFilter: string;
  setTechnicianFilter: (technician: string) => void;
  statusFilter: string[];
  setStatusFilter: (status: string[]) => void;
  businessHours: BusinessHour[];
  currentDate: Date;
}

export function CalendarFilters({
  technicianFilter,
  setTechnicianFilter,
  statusFilter,
  setStatusFilter,
  businessHours,
  currentDate,
}: CalendarFiltersProps) {
  // State to hold technicians once fetched
  const [technicians, setTechnicians] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch technicians on component mount
  useEffect(() => {
    const loadTechnicians = async () => {
      try {
        const techData = await getUniqueTechnicians();
        setTechnicians(techData);
      } catch (error) {
        console.error("Error loading technicians:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTechnicians();
  }, []);

  // Reset all filters
  const resetFilters = () => {
    setTechnicianFilter("all");
    setStatusFilter([]);
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select
        value={technicianFilter}
        onValueChange={(value) => setTechnicianFilter(value)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="All Technicians" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Technicians</SelectItem>
          {technicians && technicians.map((tech) => (
            <SelectItem key={tech} value={tech}>
              {tech}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Status Filter
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
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

      <Button 
        variant="outline" 
        className="flex items-center gap-2"
        onClick={resetFilters}
      >
        <RefreshCw className="h-4 w-4" />
        Reset Filters
      </Button>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Business Hours
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="end">
          <BusinessHoursInfo 
            businessHours={businessHours} 
            currentDate={currentDate} 
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
