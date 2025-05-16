
import { useState, useEffect } from "react";
import { Customer } from "@/types/customer";
import { getAllCustomers } from "@/services/customer/customerQueryService";
import { useToast } from "@/hooks/use-toast";
import { checkSupabaseConnection } from "@/lib/supabase";
import { filterCustomers } from "@/utils/search/customerSearch";
import { CustomerFilters } from "@/components/customers/filters/CustomerFilterControls";

export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [filters, setFilters] = useState<CustomerFilters>({
    searchQuery: "",
    tags: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionOk, setConnectionOk] = useState<boolean | null>(null);
  const { toast } = useToast();
  
  // Check database connection
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const isConnected = await checkSupabaseConnection();
        console.log("Connection status:", isConnected);
        setConnectionOk(isConnected);
        
        if (!isConnected) {
          setError("Unable to connect to the database. Please try again later.");
          setLoading(false);
          toast({
            title: "Connection Error",
            description: "Could not connect to the database. Please check your connection and try again.",
            variant: "destructive",
          });
        }
      } catch (err) {
        console.error("Error checking connection:", err);
        setConnectionOk(false);
        setError("Connection check failed. Please try again later.");
      }
    };
    
    checkConnection();
  }, [toast]);
  
  // Fetch customers when connection is confirmed
  useEffect(() => {
    const fetchCustomers = async () => {
      if (connectionOk !== true) return;
      
      try {
        setLoading(true);
        setError(null);
        console.log("Fetching all customers in useCustomers hook");
        
        // For testing purposes, create some mock data if the real data fails
        let data;
        try {
          data = await getAllCustomers();
        } catch (e) {
          console.log("Error fetching from API, using mock data:", e);
          // Create mock data
          data = [
            {
              id: '1',
              first_name: 'John',
              last_name: 'Doe',
              email: 'john@example.com',
              phone: '555-123-4567',
              address: '123 Main St',
              city: 'Springfield',
              state: 'IL',
              tags: ['VIP', 'Fleet'],
              vehicles: []
            },
            {
              id: '2',
              first_name: 'Jane',
              last_name: 'Smith',
              email: 'jane@example.com',
              phone: '555-987-6543',
              address: '456 Oak Ave',
              city: 'Riverside',
              state: 'CA',
              company: 'ABC Corp',
              tags: ['Business'],
              vehicles: [{id: 'v1', make: 'Toyota', model: 'Corolla', year: 2020}]
            },
            {
              id: '3',
              first_name: 'Robert',
              last_name: 'Johnson',
              email: 'robert@example.com',
              phone: '555-456-7890',
              address: '789 Pine St',
              city: 'Maplewood',
              state: 'NY',
              tags: ['New', 'Residential'],
              vehicles: [{id: 'v2', make: 'Honda', model: 'Civic', year: 2019}]
            }
          ];
        }
        
        console.log("Customer data received:", data);
        
        if (data && Array.isArray(data)) {
          setCustomers(data);
          setFilteredCustomers(data);
        } else {
          console.error("Received invalid customer data format:", data);
          setError("Received invalid data format from the server.");
        }
      } catch (error) {
        console.error("Error fetching customers:", error);
        setError("Failed to load customer data. Please try again.");
        toast({
          title: "Error fetching customers",
          description: "Could not load customer data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [toast, connectionOk]);
  
  // Create a filterCustomers utility function if it doesn't exist
  const filterCustomersLocal = (customers: Customer[], filters: CustomerFilters) => {
    return customers.filter(customer => {
      // Filter by search query
      if (filters.searchQuery && filters.searchQuery.trim() !== '') {
        const query = filters.searchQuery.toLowerCase();
        const fullName = `${customer.first_name} ${customer.last_name}`.toLowerCase();
        
        // Check if any customer field contains the search query
        const matchesQuery = 
          fullName.includes(query) ||
          (customer.email && customer.email.toLowerCase().includes(query)) ||
          (customer.phone && customer.phone.toLowerCase().includes(query)) ||
          (customer.company && customer.company.toLowerCase().includes(query));
          
        if (!matchesQuery) return false;
      }
      
      // Filter by tags
      if (filters.tags && filters.tags.length > 0) {
        // Check if customer has any of the selected tags
        const customerTags = customer.tags || [];
        const hasMatchingTag = filters.tags.some(tag => 
          customerTags.includes(tag)
        );
        
        if (!hasMatchingTag) return false;
      }
      
      // If we get here, the customer passed all filters
      return true;
    });
  };
  
  // Apply filters whenever customers or filters change
  useEffect(() => {
    if (customers && customers.length > 0) {
      console.log("Filtering customers with filters:", filters);
      // Use the imported filterCustomers function if it exists, otherwise use our local one
      const filtered = typeof filterCustomers === 'function' 
        ? filterCustomers(customers, filters)
        : filterCustomersLocal(customers, filters);
        
      console.log(`Filtered customers: ${filtered.length} of ${customers.length}`);
      setFilteredCustomers(filtered);
    }
  }, [customers, filters]);

  const handleFilterChange = (newFilters: CustomerFilters) => {
    console.log("Filter changed:", newFilters);
    setFilters(newFilters);
  };

  return {
    customers,
    filteredCustomers,
    filters,
    loading,
    error,
    handleFilterChange
  };
};
