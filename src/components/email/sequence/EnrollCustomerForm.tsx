
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface EnrollCustomerFormProps {
  sequenceId: string;
  onEnroll: (customerId: string) => Promise<boolean>;
  isLoading?: boolean;
}

export function EnrollCustomerForm({ 
  sequenceId, 
  onEnroll,
  isLoading = false
}: EnrollCustomerFormProps) {
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [isCustomerSearchOpen, setIsCustomerSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [enrollmentSuccess, setEnrollmentSuccess] = useState(false);

  // Fetch initial customers list
  useEffect(() => {
    const fetchCustomers = async () => {
      setIsSearching(true);
      try {
        const { data, error } = await supabase
          .from('customers')
          .select('id, first_name, last_name, email')
          .limit(5);
        
        if (error) throw error;
        setCustomers(data || []);
        setSearchResults(data || []);
      } catch (error) {
        console.error('Error fetching customers:', error);
      } finally {
        setIsSearching(false);
      }
    };

    fetchCustomers();
  }, []);

  // Search customers when searchTerm changes
  useEffect(() => {
    const searchCustomers = async () => {
      if (!searchTerm.trim()) {
        setSearchResults(customers);
        return;
      }

      setIsSearching(true);
      try {
        const { data, error } = await supabase
          .from('customers')
          .select('id, first_name, last_name, email')
          .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
          .limit(10);
        
        if (error) throw error;
        setSearchResults(data || []);
      } catch (error) {
        console.error('Error searching customers:', error);
      } finally {
        setIsSearching(false);
      }
    };

    const debounce = setTimeout(() => {
      if (isCustomerSearchOpen) {
        searchCustomers();
      }
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchTerm, isCustomerSearchOpen, customers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await onEnroll(selectedCustomerId);
    if (success) {
      setEnrollmentSuccess(true);
      // Reset after 2 seconds
      setTimeout(() => {
        setEnrollmentSuccess(false);
        setSelectedCustomerId("");
      }, 2000);
    }
  };

  const getSelectedCustomerName = () => {
    const customer = customers.find(c => c.id === selectedCustomerId);
    return customer ? `${customer.first_name} ${customer.last_name}` : '';
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label htmlFor="customer">Customer</Label>
        <div className="relative">
          <Input
            id="customer-search"
            placeholder="Search customer by name or email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setIsCustomerSearchOpen(true)}
            className="w-full"
          />
          
          {isCustomerSearchOpen && (
            <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
              {isSearching ? (
                <div className="p-2 text-center text-sm text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin mx-auto mb-1" />
                  Searching...
                </div>
              ) : searchResults.length === 0 ? (
                <div className="p-2 text-center text-sm text-gray-500">
                  No customers found
                </div>
              ) : (
                searchResults.map((customer) => (
                  <div
                    key={customer.id}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setSelectedCustomerId(customer.id);
                      setSearchTerm(`${customer.first_name} ${customer.last_name}`);
                      setIsCustomerSearchOpen(false);
                    }}
                  >
                    <div className="font-medium">{customer.first_name} {customer.last_name}</div>
                    <div className="text-sm text-gray-500">{customer.email}</div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
        
        {selectedCustomerId && (
          <div className="text-sm text-muted-foreground mt-1">
            Selected: {getSelectedCustomerName()}
          </div>
        )}
      </div>

      <div className="flex justify-end pt-4">
        <Button 
          type="submit" 
          disabled={isLoading || !selectedCustomerId || enrollmentSuccess}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enrolling...
            </>
          ) : enrollmentSuccess ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Enrolled
            </>
          ) : (
            'Enroll Customer'
          )}
        </Button>
      </div>
    </form>
  );
}
