
import { useState, useEffect } from "react";
import { Customer, CustomerCommunication, CustomerNote } from "@/types/customer";
import { getCustomerById } from "@/services/customerService";
import { CustomerInteraction } from "@/types/interaction";
import { getMockInteractions } from "@/data/interactionsData";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useCustomerDetails = (id?: string) => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [customerWorkOrders, setCustomerWorkOrders] = useState<any[]>([]);
  const [customerInteractions, setCustomerInteractions] = useState<CustomerInteraction[]>([]);
  const [customerCommunications, setCustomerCommunications] = useState<CustomerCommunication[]>([]);
  const [customerNotes, setCustomerNotes] = useState<CustomerNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [addInteractionOpen, setAddInteractionOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("service");
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      loadCustomerDetails(id);
    }
  }, [id]);

  const loadCustomerDetails = async (customerId: string) => {
    setLoading(true);
    try {
      // Fetch customer data
      const customerData = await getCustomerById(customerId);
      if (customerData) {
        setCustomer(customerData);
      }

      // Load work orders (would be fetched from Supabase in a real implementation)
      setCustomerWorkOrders([]);

      // Load interactions
      const interactions = await getMockInteractions(customerId);
      setCustomerInteractions(interactions);

      // Fetch communications from Supabase
      fetchCustomerCommunications(customerId);
      
      // Fetch notes from Supabase (would be implemented in a real app)
      // We're not implementing this for now
      setCustomerNotes([]);

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
      setCustomerCommunications(data || []);
    } catch (error) {
      console.error("Error fetching communications:", error);
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
    handleInteractionAdded,
    handleCommunicationAdded,
    handleNoteAdded
  };
};
