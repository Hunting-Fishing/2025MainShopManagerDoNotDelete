
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, File, Package, FileText, User, Wrench, ClipboardList, Calendar, Settings, BarChart3, Home } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";

interface GlobalCommandMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSearch: (query: string) => void;
}

export function GlobalCommandMenu({ open, onOpenChange, onSearch }: GlobalCommandMenuProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  
  // Reset search query when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setSearchQuery("");
    }
  }, [open]);
  
  // Execute global search
  const handleSearch = () => {
    if (searchQuery.trim()) {
      onSearch(searchQuery);
    }
  };
  
  // Navigate to page and close menu
  const navigateTo = (path: string) => {
    navigate(path);
    onOpenChange(false);
  };
  
  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput 
        placeholder="Type a command or search..." 
        value={searchQuery}
        onValueChange={setSearchQuery}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        
        {searchQuery && (
          <CommandGroup heading="Search">
            <CommandItem onSelect={handleSearch}>
              <Search className="mr-2 h-4 w-4" />
              <span>Search for "{searchQuery}"</span>
            </CommandItem>
          </CommandGroup>
        )}
        
        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => navigateTo("/")}>
            <Home className="mr-2 h-4 w-4 text-slate-600" />
            <span>Dashboard</span>
          </CommandItem>
          <CommandItem onSelect={() => navigateTo("/work-orders")}>
            <ClipboardList className="mr-2 h-4 w-4 text-blue-500" />
            <span>Work Orders</span>
          </CommandItem>
          <CommandItem onSelect={() => navigateTo("/invoices")}>
            <FileText className="mr-2 h-4 w-4 text-green-500" />
            <span>Invoices</span>
          </CommandItem>
          <CommandItem onSelect={() => navigateTo("/inventory")}>
            <Package className="mr-2 h-4 w-4 text-red-500" />
            <span>Inventory</span>
          </CommandItem>
          <CommandItem onSelect={() => navigateTo("/customers")}>
            <User className="mr-2 h-4 w-4 text-purple-500" />
            <span>Customers</span>
          </CommandItem>
          <CommandItem onSelect={() => navigateTo("/equipment")}>
            <Wrench className="mr-2 h-4 w-4 text-orange-500" />
            <span>Equipment</span>
          </CommandItem>
          <CommandItem onSelect={() => navigateTo("/calendar")}>
            <Calendar className="mr-2 h-4 w-4 text-indigo-500" />
            <span>Calendar</span>
          </CommandItem>
          <CommandItem onSelect={() => navigateTo("/reports")}>
            <BarChart3 className="mr-2 h-4 w-4 text-yellow-500" />
            <span>Reports</span>
          </CommandItem>
        </CommandGroup>
        
        <CommandSeparator />
        
        <CommandGroup heading="Quick Actions">
          <CommandItem onSelect={() => navigateTo("/work-orders/new")}>
            <File className="mr-2 h-4 w-4" />
            <span>Create Work Order</span>
          </CommandItem>
          <CommandItem onSelect={() => navigateTo("/invoices/new")}>
            <File className="mr-2 h-4 w-4" />
            <span>Create Invoice</span>
          </CommandItem>
          <CommandItem onSelect={() => navigateTo("/settings")}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
