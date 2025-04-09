
import { useState, useEffect, useCallback } from "react";
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

      // Fetch customer interactions from Supabase
      try {
        const { data: interactions, error: interactionsError } = await supabase
          .from('customer_interactions')
          .select('*')
          .eq('customer_id', customerId)
          .order('date', { ascending: false });

        if (interactionsError) {
          console.error("Error fetching interactions:", interactionsError);
          setCustomerInteractions([]);
        } else {
          // Convert the database format to match our CustomerInteraction type
          const formattedInteractions = interactions?.map(item => ({
            id: item.id,
            customerId: item.customer_id,
            customerName: customer?.name || `${customer?.first_name} ${customer?.last_name}`,
            date: item.date,
            type: item.type as any,
            description: item.description,
            staffMemberId: item.staff_member_id,
            staffMemberName: item.staff_member_name,
            status: item.status as any,
            notes: item.notes,
            relatedWorkOrderId: item.related_work_order_id,
            followUpDate: item.follow_up_date,
            followUpCompleted: item.follow_up_completed
          })) || [];
          
          setCustomerInteractions(formattedInteractions);
        }
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
  const refreshCustomerData = useCallback(async () => {
    if (id) {
      loadCustomerDetails(id);
    }
  }, [id]);

  const handleInteractionAdded = useCallback((interaction: CustomerInteraction) => {
    setCustomerInteractions(prev => [interaction, ...prev]);
    setActiveTab("interactions");
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
