
import { useState } from "react";
import { 
  ChevronDown, 
  Download, 
  Filter, 
  RefreshCw, 
  Search, 
  SlidersHorizontal 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { statusMap } from "./InvoiceList";

interface InvoiceFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: string[];
  setStatusFilter: (statuses: string[]) => void;
  createdByFilter: string;
  setCreatedByFilter: (creator: string) => void;
  creators: string[];
  onResetFilters: () => void;
}

export function InvoiceFilters({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  createdByFilter,
  setCreatedByFilter,
  creators,
  onResetFilters
}: InvoiceFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
      <div className="relative w-full md:max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <Input
          type="search"
          placeholder="Search invoices..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

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
                {value.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Select
          value={createdByFilter}
          onValueChange={setCreatedByFilter}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Staff" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Staff</SelectItem>
            {creators.map((creator) => (
              <SelectItem key={creator} value={creator}>
                {creator}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button variant="outline" className="flex items-center gap-2" onClick={onResetFilters}>
          <RefreshCw className="h-4 w-4" />
          Reset
        </Button>

        <Button variant="outline" className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          More Filters
        </Button>

        <Button variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>
    </div>
  );
}
