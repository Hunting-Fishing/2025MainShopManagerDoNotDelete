
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
        const data = await getAllCustomers();
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
  
  // Apply filters whenever customers or filters change
  useEffect(() => {
    if (customers && customers.length > 0) {
      console.log("Filtering customers with filters:", filters);
      const filtered = filterCustomers(customers, filters);
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
