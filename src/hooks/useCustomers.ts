
import { useState, useEffect, useCallback } from "react";
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
        console.log("Supabase connection status:", isConnected);
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
        const data = await getAllCustomers();
        console.log(`Customer data received - count: ${data?.length || 0}`);
        
        if (data && Array.isArray(data)) {
          setCustomers(data);
          setFilteredCustomers(data);
        } else {
          console.error("Received invalid customer data format:", data);
          setError("Received invalid data format from the server.");
          toast({
            title: "Error loading data",
            description: "The customer data format was invalid. Please try again.",
            variant: "destructive",
          });
        }
      } catch (error: any) {
        console.error("Error fetching customers:", error);
        setError(error?.message || "Failed to load customer data. Please try again.");
        toast({
          title: "Error fetching customers",
          description: error?.message || "Could not load customer data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [toast, connectionOk]);
  
  // Apply filters whenever customers or filters change
  useEffect(() => {
    if (customers && customers.length > 0) {
      console.log("Filtering customers with filters:", filters);
      const filtered = filterCustomers(customers, filters);
      console.log(`Filtered customers: ${filtered.length} of ${customers.length}`);
      setFilteredCustomers(filtered);
    }
  }, [customers, filters]);

  const handleFilterChange = useCallback((newFilters: CustomerFilters) => {
    console.log("Filter changed:", newFilters);
    setFilters(newFilters);
  }, []);
  
  // Function to manually refresh customers
  const refreshCustomers = useCallback(async () => {
    if (connectionOk !== true) {
      toast({
        title: "Connection Error",
        description: "Cannot refresh customers. Please check your internet connection.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      console.log("Manually refreshing customers");
      const data = await getAllCustomers();
      console.log(`Customer refresh complete - count: ${data?.length || 0}`);
      
      if (data && Array.isArray(data)) {
        setCustomers(data);
        setFilteredCustomers(filterCustomers(data, filters));
        toast({
          title: "Data Refreshed",
          description: "Customer data has been refreshed successfully.",
          variant: "default",
        });
      } else {
        throw new Error("Invalid data format received");
      }
    } catch (error: any) {
      console.error("Error refreshing customers:", error);
      setError(error?.message || "Failed to refresh customer data.");
      toast({
        title: "Refresh Failed",
        description: error?.message || "Could not refresh customer data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [connectionOk, filters, toast]);

  return {
    customers,
    filteredCustomers,
    filters,
    loading,
    error,
    handleFilterChange,
    refreshCustomers
  };
};
