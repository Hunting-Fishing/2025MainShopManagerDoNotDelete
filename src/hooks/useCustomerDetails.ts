
import { useState, useEffect } from "react";
import { Customer, CustomerCommunication, CustomerNote } from "@/types/customer";
import { getCustomerById } from "@/services/customer";
import { CustomerInteraction } from "@/types/interaction";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { getCustomerNotes } from "@/services/customers";

export const useCustomerDetails = (id?: string) => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [customerWorkOrders, setCustomerWorkOrders] = useState<any[]>([]);
  const [customerInteractions, setCustomerInteractions] = useState<CustomerInteraction[]>([]);
  const [customerCommunications, setCustomerCommunications] = useState<CustomerCommunication[]>([]);
  const [customerNotes, setCustomerNotes] = useState<CustomerNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [addInteractionOpen, setAddInteractionOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      loadCustomerDetails(id);
    }
  }, [id]);

  const loadCustomerDetails = async (customerId: string) => {
    setLoading(true);
    try {
      // Fetch customer data with vehicles included
      console.log("Loading customer details for ID:", customerId);
      const customerData = await getCustomerById(customerId);
      console.log("Customer data loaded:", customerData);
      
      if (customerData) {
        setCustomer(customerData);
      }

      // Load work orders from Supabase
      const { data: workOrders, error: workOrdersError } = await supabase
        .from('work_orders')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });

      if (workOrdersError) throw workOrdersError;
      setCustomerWorkOrders(workOrders || []);

      // Custom interaction logic since the table might not exist yet
      try {
        // Instead of querying a non-existent table, we'll generate mock data or handle differently
        // For now, we'll just initialize with an empty array
        setCustomerInteractions([]);
      } catch (error) {
        console.error("Error handling interactions:", error);
        setCustomerInteractions([]);
      }

      // Fetch communications from Supabase
      fetchCustomerCommunications(customerId);
      
      // Fetch notes from Supabase
      fetchCustomerNotes(customerId);

    } catch (error) {
      console.error("Error loading customer details:", error);
      toast({
        title: "Error",
        description: "Failed to load customer details. Please try again.",
        variant: "destructive",
      });
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

      if (error) throw error;
      
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
    }
  };

  const fetchCustomerNotes = async (customerId: string) => {
    try {
      const notes = await getCustomerNotes(customerId);
      setCustomerNotes(notes);
    } catch (error) {
      console.error("Error fetching notes:", error);
    }
  };

  // Function to refresh customer data
  const refreshCustomerData = async () => {
    if (id) {
      loadCustomerDetails(id);
    }
  };

  const handleInteractionAdded = (interaction: CustomerInteraction) => {
    setCustomerInteractions(prev => [interaction, ...prev]);
    setActiveTab("interactions");
  };

  const handleCommunicationAdded = (communication: CustomerCommunication) => {
    setCustomerCommunications(prev => [communication, ...prev]);
  };

  const handleNoteAdded = (note: CustomerNote) => {
    setCustomerNotes(prev => [note, ...prev]);
  };

  return {
    customer,
    customerWorkOrders,
    customerInteractions,
    customerCommunications,
    customerNotes,
    loading,
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
