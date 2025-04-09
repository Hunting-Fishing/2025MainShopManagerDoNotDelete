
import { useState, useEffect } from "react";
import { Customer } from "@/types/customer";
import { getAllCustomers } from "@/services/customer";
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
  
  useEffect(() => {
    const checkConnection = async () => {
      const isConnected = await checkSupabaseConnection();
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
    };
    
    checkConnection();
  }, [toast]);
  
  useEffect(() => {
    const fetchCustomers = async () => {
      if (connectionOk !== true) return;
      
      try {
        setLoading(true);
        setError(null);
        console.log("Fetching all customers in useCustomers hook");
        const data = await getAllCustomers();
        console.log("Customer data received:", data);
        setCustomers(data);
        setFilteredCustomers(data);
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
  
  useEffect(() => {
    setFilteredCustomers(filterCustomers(customers, filters));
  }, [customers, filters]);

  const handleFilterChange = (newFilters: CustomerFilters) => {
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
