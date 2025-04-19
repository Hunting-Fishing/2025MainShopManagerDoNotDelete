
import React, { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Search, Save, Filter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface AdvancedSearchCriteria {
  description?: string;
  customerId?: string;
  vehicleId?: string;
  startDateRange?: Date;
  endDateRange?: Date;
  minBillableHours?: number;
  maxBillableHours?: number;
  includeCompletedWorkOrders: boolean;
  includeCancelledWorkOrders: boolean;
}

interface WorkOrderAdvancedSearchProps {
  onSearch: (criteria: AdvancedSearchCriteria) => void;
}

export function WorkOrderAdvancedSearch({ onSearch }: WorkOrderAdvancedSearchProps) {
  const [open, setOpen] = useState(false);
  const [criteria, setCriteria] = useState<AdvancedSearchCriteria>({
    includeCompletedWorkOrders: true,
    includeCancelledWorkOrders: false,
  });
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  
  const handleSearch = () => {
    onSearch({
      ...criteria,
      startDateRange: startDate,
      endDateRange: endDate,
    });
    setOpen(false);
  };
  
  const handleReset = () => {
    setCriteria({
      includeCompletedWorkOrders: true,
      includeCancelledWorkOrders: false,
    });
    setStartDate(undefined);
    setEndDate(undefined);
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Search className="h-4 w-4" />
          Advanced Search
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Advanced Search</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={criteria.description || ""}
                onChange={(e) => setCriteria({...criteria, description: e.target.value})}
                placeholder="Search in description..."
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="customer">Customer ID</Label>
              <Input
                id="customer"
                value={criteria.customerId || ""}
                onChange={(e) => setCriteria({...criteria, customerId: e.target.value})}
                placeholder="Customer ID"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="vehicle">Vehicle ID</Label>
              <Input
                id="vehicle"
                value={criteria.vehicleId || ""}
                onChange={(e) => setCriteria({...criteria, vehicleId: e.target.value})}
                placeholder="Vehicle ID"
              />
            </div>
            
            <div className="grid gap-2">
              <Label>Status</Label>
              <div className="flex flex-col gap-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="completedOrders" 
                    checked={criteria.includeCompletedWorkOrders}
                    onCheckedChange={(checked) => 
                      setCriteria({...criteria, includeCompletedWorkOrders: !!checked})
                    }
                  />
                  <Label htmlFor="completedOrders" className="text-sm font-normal">Include completed work orders</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="cancelledOrders" 
                    checked={criteria.includeCancelledWorkOrders}
                    onCheckedChange={(checked) => 
                      setCriteria({...criteria, includeCancelledWorkOrders: !!checked})
                    }
                  />
                  <Label htmlFor="cancelledOrders" className="text-sm font-normal">Include cancelled work orders</Label>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="grid gap-2">
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                    disabled={(date) => 
                      startDate ? date < startDate : false
                    }
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="minHours">Min Billable Hours</Label>
              <Input
                id="minHours"
                type="number"
                min="0"
                step="0.5"
                value={criteria.minBillableHours || ""}
                onChange={(e) => setCriteria({
                  ...criteria, 
                  minBillableHours: e.target.value ? parseFloat(e.target.value) : undefined
                })}
                placeholder="Minimum hours"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="maxHours">Max Billable Hours</Label>
              <Input
                id="maxHours"
                type="number"
                min="0"
                step="0.5"
                value={criteria.maxBillableHours || ""}
                onChange={(e) => setCriteria({
                  ...criteria, 
                  maxBillableHours: e.target.value ? parseFloat(e.target.value) : undefined
                })}
                placeholder="Maximum hours"
              />
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleReset}>Reset</Button>
          <Button onClick={handleSearch} className="bg-indigo-600 hover:bg-indigo-700">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
