
import React, { useState } from "react";
import { Search, Calendar, Filter } from "lucide-react";
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
import { statusMap, priorityMap } from "@/utils/workOrders";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { supabase } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";

interface WorkOrderFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: string[];
  setStatusFilter: (statuses: string[]) => void;
  priorityFilter: string[];
  setPriorityFilter: (priorities: string[]) => void;
  selectedTechnician: string;
  setSelectedTechnician: (technician: string) => void;
  dateRange: { from: Date | undefined; to: Date | undefined };
  setDateRange: (range: { from: Date | undefined; to: Date | undefined }) => void;
  serviceCategory: string;
  setServiceCategory: (category: string) => void;
  technicians: string[];
  resetFilters: () => void;
}

const WorkOrderFilters: React.FC<WorkOrderFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  priorityFilter,
  setPriorityFilter,
  selectedTechnician,
  setSelectedTechnician,
  dateRange,
  setDateRange,
  serviceCategory,
  setServiceCategory,
  technicians,
  resetFilters,
}) => {
  const [serviceCategories, setServiceCategories] = useState<{ id: string; name: string }[]>([]);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isFetchingCategories, setIsFetchingCategories] = useState(false);

  // Fetch service categories when dropdown is opened
  React.useEffect(() => {
    const fetchServiceCategories = async () => {
      setIsFetchingCategories(true);
      try {
        const { data, error } = await supabase
          .from('service_categories')
          .select('id, name')
          .eq('is_active', true)
          .order('name');
          
        if (!error && data) {
          setServiceCategories(data);
        }
      } catch (err) {
        console.error('Error fetching service categories:', err);
      } finally {
        setIsFetchingCategories(false);
      }
    };
    
    fetchServiceCategories();
  }, []);

  const handleStatusChange = (status: string) => {
    if (statusFilter.includes(status)) {
      setStatusFilter(statusFilter.filter(s => s !== status));
    } else {
      setStatusFilter([...statusFilter, status]);
    }
  };
  
  const handlePriorityChange = (priority: string) => {
    if (priorityFilter.includes(priority)) {
      setPriorityFilter(priorityFilter.filter(p => p !== priority));
    } else {
      setPriorityFilter([...priorityFilter, priority]);
    }
  };

  // Calculate the total number of active filters
  const activeFilterCount = 
    statusFilter.length + 
    priorityFilter.length + 
    (selectedTechnician !== "all" ? 1 : 0) +
    (dateRange.from ? 1 : 0) +
    (serviceCategory !== "all" ? 1 : 0);

  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="flex flex-wrap gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search work orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>

        {/* Date Range Filter */}
        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              {dateRange.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "MMM d, yyyy")} -{" "}
                    {format(dateRange.to, "MMM d, yyyy")}
                  </>
                ) : (
                  format(dateRange.from, "MMM d, yyyy")
                )
              ) : (
                "Date Range"
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarComponent
              initialFocus
              mode="range"
              selected={{
                from: dateRange.from,
                to: dateRange.to,
              }}
              onSelect={(selectedRange) => {
                setDateRange({
                  from: selectedRange?.from,
                  to: selectedRange?.to,
                });
                if (selectedRange?.from) {
                  setTimeout(() => setIsCalendarOpen(false), 500);
                }
              }}
              numberOfMonths={2}
            />
            <div className="flex justify-end p-3 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setDateRange({ from: undefined, to: undefined });
                  setIsCalendarOpen(false);
                }}
              >
                Clear
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* Status Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Status {statusFilter.length > 0 && `(${statusFilter.length})`}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {Object.entries(statusMap).map(([key, label]) => (
              <DropdownMenuCheckboxItem
                key={key}
                checked={statusFilter.includes(key)}
                onCheckedChange={() => handleStatusChange(key)}
              >
                {String(label)}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        
        {/* Priority Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Priority {priorityFilter.length > 0 && `(${priorityFilter.length})`}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Filter by Priority</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {Object.entries(priorityMap).map(([key, value]) => (
              <DropdownMenuCheckboxItem
                key={key}
                checked={priorityFilter.includes(key)}
                onCheckedChange={() => handlePriorityChange(key)}
              >
                {value.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Service Category Filter */}
        <Select
          value={serviceCategory}
          onValueChange={(value) => setServiceCategory(value)}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Service Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {isFetchingCategories ? (
              <SelectItem value="loading" disabled>
                Loading...
              </SelectItem>
            ) : (
              serviceCategories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>

        {/* Technician Filter */}
        <Select
          value={selectedTechnician}
          onValueChange={(value) => setSelectedTechnician(value)}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All technicians" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All technicians</SelectItem>
            {technicians.map((tech) => (
              <SelectItem key={tech} value={tech}>
                {tech}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Reset Filters */}
        <Button 
          variant={activeFilterCount > 0 ? "default" : "ghost"} 
          onClick={resetFilters}
          className={activeFilterCount > 0 ? "bg-indigo-600 hover:bg-indigo-700" : ""}
        >
          <Filter className="h-4 w-4 mr-2" />
          Reset Filters
          {activeFilterCount > 0 && (
            <Badge className="ml-2 bg-white text-indigo-600 hover:bg-white">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </div>
    </div>
  );
};

export default WorkOrderFilters;
