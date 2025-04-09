
import { useState, useEffect, useCallback } from "react";
import { Customer, CustomerCommunication, CustomerNote } from "@/types/customer";
import { getCustomerById } from "@/services/customer";
import { CustomerInteraction } from "@/types/interaction";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { getCustomerNotes } from "@/services/customers";
import { getCustomerInteractions } from "@/services/customer/customerInteractionsService";
import { handleApiError } from "@/utils/errorHandling";

export const useCustomerDetails = (id?: string) => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [customerWorkOrders, setCustomerWorkOrders] = useState<any[]>([]);
  const [customerInteractions, setCustomerInteractions] = useState<CustomerInteraction[]>([]);
  const [customerCommunications, setCustomerCommunications] = useState<CustomerCommunication[]>([]);
  const [customerNotes, setCustomerNotes] = useState<CustomerNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addInteractionOpen, setAddInteractionOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();

  useEffect(() => {
    // Validate ID before making any API calls
    if (!id || id === "undefined") {
      setError("Invalid customer ID provided");
      setLoading(false);
      return;
    }
    
    loadCustomerDetails(id);
  }, [id]);

  const loadCustomerDetails = async (customerId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      if (!customerId || customerId === "undefined") {
        throw new Error("Invalid customer ID provided");
      }
      
      // Fetch customer data with vehicles included
      console.log("Loading customer details for ID:", customerId);
      const customerData = await getCustomerById(customerId);
      console.log("Customer data loaded:", customerData);
      
      if (customerData) {
        setCustomer(customerData);
      } else {
        setError("Customer not found");
        toast({
          title: "Not Found",
          description: "Customer could not be found",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Load work orders from Supabase
      const { data: workOrders, error: workOrdersError } = await supabase
        .from('work_orders')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });

      if (workOrdersError) {
        console.error("Error fetching work orders:", workOrdersError);
        toast({
          title: "Warning", 
          description: "Could not load customer work orders",
          variant: "warning",
        });
      } else {
        setCustomerWorkOrders(workOrders || []);
      }

      // Fetch customer interactions using the updated service
      try {
        const interactions = await getCustomerInteractions(customerId);
        setCustomerInteractions(interactions || []);
      } catch (interactionError) {
        console.error("Error handling interactions:", interactionError);
        toast({
          title: "Warning", 
          description: "Could not load customer interactions",
          variant: "warning",
        });
        setCustomerInteractions([]);
      }

      // Fetch communications from Supabase
      fetchCustomerCommunications(customerId);
      
      // Fetch notes from Supabase
      fetchCustomerNotes(customerId);

    } catch (error) {
      console.error("Error loading customer details:", error);
      setError("Failed to load customer details");
      handleApiError(error, "Failed to load customer details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerCommunications = async (customerId: string) => {
    try {
      const { data, error } = await supabase
        .from('customer_communications')
        .select('*')
        .eq('customer_id', customerId)
        .order('date', { ascending: false });

      if (error) {
        console.error("Error fetching communications:", error);
        toast({
          title: "Warning", 
          description: "Could not load customer communications",
          variant: "warning",
        });
        return;
      }
      
      // Convert the type to the correct enum type
      const typedCommunications = data?.map(comm => ({
        ...comm,
        type: comm.type as "email" | "phone" | "text" | "in-person",
        direction: comm.direction as "incoming" | "outgoing",
        status: comm.status as "completed" | "pending" | "failed"
      })) || [];
      
      setCustomerCommunications(typedCommunications);
    } catch (error) {
      console.error("Error fetching communications:", error);
      handleApiError(error, "Could not load customer communications");
    }
  };

  const fetchCustomerNotes = async (customerId: string) => {
    try {
      const notes = await getCustomerNotes(customerId);
      setCustomerNotes(notes);
    } catch (error) {
      console.error("Error fetching notes:", error);
      handleApiError(error, "Could not load customer notes");
    }
  };

  // Function to refresh customer data
  const refreshCustomerData = useCallback(async () => {
    if (id && id !== "undefined") {
      loadCustomerDetails(id);
    } else {
      setError("Cannot refresh: Missing or invalid customer ID");
      toast({
        title: "Error",
        description: "Cannot refresh customer data: Missing ID",
        variant: "destructive",
      });
    }
  }, [id, toast]);

  const handleInteractionAdded = useCallback((interaction: CustomerInteraction) => {
    setCustomerInteractions(prev => [interaction, ...prev]);
    setActiveTab("history");
  }, []);

  const handleCommunicationAdded = useCallback((communication: CustomerCommunication) => {
    setCustomerCommunications(prev => [communication, ...prev]);
  }, []);

  const handleNoteAdded = useCallback((note: CustomerNote) => {
    setCustomerNotes(prev => [note, ...prev]);
  }, []);

  return {
    customer,
    customerWorkOrders,
    customerInteractions,
    customerCommunications,
    customerNotes,
    loading,
    error,
    addInteractionOpen,
    setAddInteractionOpen,
    activeTab,
    setActiveTab,
    refreshCustomerData,
    handleInteractionAdded,
    handleCommunicationAdded,
    handleNoteAdded
  };
};
