
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
  const [connectionChecked, setConnectionChecked] = useState(false);
  const { toast } = useToast();
  
  // Check database connection
  useEffect(() => {
    const checkConnection = async () => {
      try {
        setLoading(true);
        console.log("Checking database connection...");
        const isConnected = await checkSupabaseConnection();
        console.log("Supabase connection status:", isConnected);
        setConnectionOk(isConnected);
        setConnectionChecked(true);
        
        if (!isConnected) {
          setError("Unable to connect to the database. Please check your internet connection and try again later.");
          toast({
            title: "Connection Error",
            description: "Could not connect to the database. Please check your connection and try again.",
            variant: "destructive",
          });
        }
      } catch (err) {
        console.error("Error checking connection:", err);
        setConnectionOk(false);
        setConnectionChecked(true);
        setError("Connection check failed. Please try again later.");
        toast({
          title: "Connection Error",
          description: "Failed to check database connection. Please try again later.",
          variant: "destructive",
        });
      } finally {
        // Even if connection check fails, we should stop the global loading state
        if (!connectionOk) {
          setLoading(false);
        }
      }
    };
    
    checkConnection();
  }, [toast]);
  
  // Fetch customers when connection is confirmed
  useEffect(() => {
    const fetchCustomers = async () => {
      if (!connectionChecked) return;
      
      if (connectionOk !== true) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        console.log("Fetching all customers in useCustomers hook");
        
        // Set a timeout for the request
        const timeout = setTimeout(() => {
          setError("Request timed out. The server might be busy. Please try again later.");
          setLoading(false);
          toast({
            title: "Request Timeout",
            description: "Customer data request took too long. Please try again.",
            variant: "destructive",
          });
        }, 30000); // 30 second timeout
        
        const data = await getAllCustomers();
        clearTimeout(timeout);
        
        console.log(`Customer data received - count: ${data?.length || 0}`);
        
        if (data && Array.isArray(data)) {
          setCustomers(data);
          setFilteredCustomers(data);
          
          if (data.length === 0) {
            toast({
              title: "No Customers Found",
              description: "No customer records were found in the database.",
              variant: "default",
            });
          }
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
        let errorMessage = "Failed to load customer data.";
        
        if (error?.message) {
          errorMessage = error.message;
        } else if (error?.error?.message) {
          errorMessage = error.error.message;
        }
        
        if (errorMessage.includes("JWT")) {
          errorMessage = "Authentication error. Please try logging in again.";
        } else if (errorMessage.includes("network")) {
          errorMessage = "Network error. Please check your internet connection.";
        }
        
        setError(errorMessage);
        toast({
          title: "Error fetching customers",
          description: errorMessage + " Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [toast, connectionOk, connectionChecked]);
  
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
    if (!connectionChecked) {
      // Check connection first if it hasn't been checked yet
      setConnectionOk(null);
      setConnectionChecked(false);
      try {
        const isConnected = await checkSupabaseConnection();
        setConnectionOk(isConnected);
        setConnectionChecked(true);
        if (!isConnected) {
          toast({
            title: "Connection Error",
            description: "Cannot refresh customers. Please check your internet connection.",
            variant: "destructive",
          });
          return;
        }
      } catch (error) {
        setConnectionOk(false);
        setConnectionChecked(true);
        toast({
          title: "Connection Error",
          description: "Failed to check database connection. Please try again later.",
          variant: "destructive",
        });
        return;
      }
    } else if (connectionOk !== true) {
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
  }, [connectionOk, filters, toast, connectionChecked]);

  return {
    customers,
    filteredCustomers,
    filters,
    loading,
    error,
    connectionOk,
    connectionChecked,
    handleFilterChange,
    refreshCustomers
  };
};
