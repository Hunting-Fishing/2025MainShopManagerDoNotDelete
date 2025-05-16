
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Filter } from "lucide-react";

export interface InvoiceFiltersDropdownProps {
  // Properties specific to the component
}

export const InvoiceFiltersDropdown: React.FC<InvoiceFiltersDropdownProps> = () => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center">
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4">
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Filter Invoices</h3>
          
          <div className="space-y-2">
            <Label htmlFor="customerName">Customer Name</Label>
            <Input id="customerName" placeholder="Search by customer name" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="invoiceStatus">Status</Label>
            <select 
              id="invoiceStatus"
              className="w-full border border-input bg-background rounded-md p-2"
              defaultValue=""
            >
              <option value="">All Statuses</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
              <option value="overdue">Overdue</option>
              <option value="draft">Draft</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <Label>Date Range</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input type="date" placeholder="From" />
              <Input type="date" placeholder="To" />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
              Clear
            </Button>
            <Button size="sm" onClick={() => setOpen(false)}>
              Apply Filters
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
