
import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";

interface FilterOption {
  label: string;
  value: string;
}

interface InvoiceFiltersDropdownProps {
  onFilterChange: (filter: string) => void;
  currentFilter: string;
}

export const InvoiceFiltersDropdown = ({ 
  onFilterChange, 
  currentFilter 
}: InvoiceFiltersDropdownProps) => {
  const statuses: FilterOption[] = [
    { label: "All Invoices", value: "all" },
    { label: "Paid", value: "paid" },
    { label: "Pending", value: "pending" },
    { label: "Overdue", value: "overdue" },
    { label: "Draft", value: "draft" },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Filter by status</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {statuses.map((status) => (
            <DropdownMenuItem
              key={status.value}
              className={currentFilter === status.value ? "bg-accent text-accent-foreground" : ""}
              onClick={() => onFilterChange(status.value)}
            >
              {status.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
