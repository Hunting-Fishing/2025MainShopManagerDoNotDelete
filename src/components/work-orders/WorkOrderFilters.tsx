import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { statusMap } from "@/utils/workOrders"; // Updated import path

interface WorkOrderFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: string[];
  setStatusFilter: (status: string[]) => void;
  selectedTechnician: string;
  setSelectedTechnician: (technician: string) => void;
  technicians: string[];
  resetFilters: () => void;
}

const WorkOrderFilters: React.FC<WorkOrderFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  selectedTechnician,
  setSelectedTechnician,
  technicians,
  resetFilters,
}) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search Input */}
        <div>
          <Label htmlFor="search">Search</Label>
          <Input
            type="search"
            id="search"
            placeholder="Search work orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Status Filter */}
        <div>
          <Label htmlFor="status">Status</Label>
          <Select
            onValueChange={(value) =>
              setStatusFilter((prev) =>
                prev.includes(value)
                  ? prev.filter((item) => item !== value)
                  : [...prev, value]
              )
            }
            defaultValue={statusFilter.join(" ")}
            multiple
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(statusMap).map(([key, value]) => (
                <SelectItem key={key} value={key}>
                  {String(value)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Technician Filter */}
        <div>
          <Label htmlFor="technician">Technician</Label>
          <Select onValueChange={setSelectedTechnician} defaultValue={selectedTechnician}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filter by technician" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Technicians</SelectItem>
              {technicians.map((technician) => (
                <SelectItem key={technician} value={technician}>
                  {technician}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Reset Filters Button */}
      <Button variant="outline" onClick={resetFilters}>
        Reset Filters
      </Button>
    </div>
  );
};

export default WorkOrderFilters;
