import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

// Status options for invoices
const statusOptions = [
  { value: "all", label: "All Statuses" },
  { value: "draft", label: "Draft" },
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
  { value: "overdue", label: "Overdue" },
  { value: "cancelled", label: "Cancelled" },
];

interface InvoiceFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  createdByFilter: string;
  setCreatedByFilter: (creator: string) => void;
  creators: string[];
  onResetFilters: () => void;
  isLoading?: boolean;
}

export function InvoiceFilters({ 
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  createdByFilter,
  setCreatedByFilter,
  creators,
  onResetFilters,
  isLoading
}: InvoiceFiltersProps) {
  const isDisabled = isLoading;
  
  return (
    <div className="flex flex-col md:flex-row gap-4 items-end">
      <div className="w-full md:w-1/3">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
          <Input
            type="search"
            placeholder="Search invoices..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={isDisabled}
          />
        </div>
      </div>
      
      <div className="w-full md:w-1/4">
        <Select 
          value={statusFilter} 
          onValueChange={setStatusFilter}
          disabled={isDisabled}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="w-full md:w-1/4">
        <Select 
          value={createdByFilter} 
          onValueChange={setCreatedByFilter}
          disabled={isDisabled}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by creator" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Creators</SelectItem>
            {creators.map((creator) => (
              <SelectItem key={creator} value={creator}>
                {creator}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <Button 
        variant="outline" 
        onClick={onResetFilters}
        className="w-full md:w-auto"
        disabled={isDisabled}
      >
        Reset Filters
      </Button>
    </div>
  );
}
