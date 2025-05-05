
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, User, Search, X } from "lucide-react";
import { Customer } from "@/types/customer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDebounce } from "@/hooks/use-debounce";

interface CustomerSearchProps {
  onSelectCustomer: (customer: Customer | null) => void;
  selectedCustomer: Customer | null;
}

export function CustomerSearch({ onSelectCustomer, selectedCustomer }: CustomerSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Search customers when input changes
  useEffect(() => {
    const fetchCustomers = async () => {
      if (debouncedSearch.length < 2) {
        setCustomers([]);
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("customers")
          .select("*")
          .or(`first_name.ilike.%${debouncedSearch}%,last_name.ilike.%${debouncedSearch}%,email.ilike.%${debouncedSearch}%,phone.ilike.%${debouncedSearch}%`)
          .limit(10);

        if (error) throw error;
        setCustomers(data || []);
        setOpen(true);
      } catch (error) {
        console.error("Error searching customers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [debouncedSearch]);

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.customer-search-container')) {
        setOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectCustomer = (customer: Customer) => {
    onSelectCustomer(customer);
    setOpen(false);
    setSearchQuery("");
  };

  return (
    <div className="customer-search-container relative w-full">
      {selectedCustomer ? (
        <div className="flex items-center bg-white dark:bg-slate-800 p-3 rounded-md shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="bg-slate-100 dark:bg-slate-700 rounded-full p-2 mr-3">
            <User className="h-5 w-5 text-slate-600 dark:text-slate-300" />
          </div>
          <div className="flex-1">
            <p className="font-medium">
              {selectedCustomer.first_name} {selectedCustomer.last_name}
            </p>
            <p className="text-sm text-muted-foreground">
              {selectedCustomer.email || selectedCustomer.phone || "No contact info"}
            </p>
            {selectedCustomer.company && (
              <Badge variant="outline" className="mt-1">
                {selectedCustomer.company}
              </Badge>
            )}
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="ml-2" 
            onClick={() => onSelectCustomer(null)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-3 top-3 text-slate-400">
            <Search className="h-4 w-4" />
          </div>
          <Input
            className="pl-10 bg-white dark:bg-slate-800"
            placeholder="Search customers by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => debouncedSearch.length >= 2 && setOpen(true)}
          />
          {loading && (
            <div className="absolute right-3 top-3">
              <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
            </div>
          )}
          
          {open && (
            <div className="absolute z-50 mt-1 w-full bg-white dark:bg-slate-800 shadow-lg rounded-md border border-slate-200 dark:border-slate-700 max-h-80 overflow-auto">
              {customers.length === 0 ? (
                <div className="p-4 text-center text-sm text-slate-500 dark:text-slate-400">
                  {debouncedSearch.length < 2 ? 
                    "Type at least 2 characters to search" : 
                    "No customers found"}
                </div>
              ) : (
                <div className="py-1">
                  {customers.map((customer) => (
                    <div
                      key={customer.id}
                      className="px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                      onClick={() => handleSelectCustomer(customer)}
                    >
                      <div className="font-medium">
                        {customer.first_name} {customer.last_name}
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        {customer.email || customer.phone || "No contact info"}
                      </div>
                      {customer.company && (
                        <Badge variant="outline" className="mt-1">
                          {customer.company}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
