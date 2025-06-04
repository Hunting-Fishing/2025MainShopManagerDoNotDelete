
import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Customer, CustomerCommunication, CustomerNote } from '@/types/customer';
import { WorkOrder } from '@/types/workOrder';
import { Interaction } from '@/types/interaction';
import { CustomerLoyalty } from '@/types/loyalty';
import { getWorkOrdersByCustomerId } from '@/services/workOrder';

export const useCustomerDetailsOptimized = (customerId: string | undefined) => {
  const [addInteractionOpen, setAddInteractionOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Main customer data query
  const { 
    data: customer, 
    isLoading: customerLoading, 
    error: customerError,
    refetch: refetchCustomer 
  } = useQuery({
    queryKey: ['customer', customerId],
    queryFn: async () => {
      if (!customerId) return null;
      
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', customerId)
        .single();
        
      if (error) throw error;
      return data as Customer;
    },
    enabled: !!customerId,
  });

  // Work orders query
  const { 
    data: customerWorkOrders, 
    isLoading: workOrdersLoading,
    error: workOrdersError,
    refetch: refetchWorkOrders 
  } = useQuery({
    queryKey: ['customerWorkOrders', customerId],
    queryFn: async () => {
      if (!customerId) return [];
      return await getWorkOrdersByCustomerId(customerId);
    },
    enabled: !!customerId,
  });

  // Interactions query
  const { 
    data: customerInteractions, 
    isLoading: interactionsLoading,
    error: interactionsError,
    refetch: refetchInteractions 
  } = useQuery({
    queryKey: ['customerInteractions', customerId],
    queryFn: async () => {
      if (!customerId) return [];
      
      const { data, error } = await supabase
        .from('customer_interactions')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data as Interaction[];
    },
    enabled: !!customerId,
  });

  // Communications query
  const { 
    data: customerCommunications, 
    isLoading: communicationsLoading,
    error: communicationsError,
    refetch: refetchCommunications 
  } = useQuery({
    queryKey: ['customerCommunications', customerId],
    queryFn: async () => {
      if (!customerId) return [];
      
      const { data, error } = await supabase
        .from('customer_communications')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data as CustomerCommunication[];
    },
    enabled: !!customerId,
  });

  // Notes query
  const { 
    data: customerNotes, 
    isLoading: notesLoading,
    error: notesError,
    refetch: refetchNotes 
  } = useQuery({
    queryKey: ['customerNotes', customerId],
    queryFn: async () => {
      if (!customerId) return [];
      
      const { data, error } = await supabase
        .from('customer_notes')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data as CustomerNote[];
    },
    enabled: !!customerId,
  });

  // Loyalty query
  const { 
    data: customerLoyalty, 
    isLoading: loyaltyLoading,
    error: loyaltyError,
    refetch: refetchLoyalty 
  } = useQuery({
    queryKey: ['customerLoyalty', customerId],
    queryFn: async () => {
      if (!customerId) return null;
      
      const { data, error } = await supabase
        .from('customer_loyalty')
        .select('*')
        .eq('customer_id', customerId)
        .single();
        
      if (error && error.code !== 'PGRST116') throw error;
      return data as CustomerLoyalty | null;
    },
    enabled: !!customerId,
  });

  const loading = customerLoading || workOrdersLoading || interactionsLoading || 
                 communicationsLoading || notesLoading || loyaltyLoading;

  const error = customerError || workOrdersError || interactionsError || 
               communicationsError || notesError || loyaltyError;

  const refreshCustomerData = useCallback(async () => {
    await Promise.all([
      refetchCustomer(),
      refetchWorkOrders(),
      refetchInteractions(),
      refetchCommunications(),
      refetchNotes(),
      refetchLoyalty()
    ]);
  }, [refetchCustomer, refetchWorkOrders, refetchInteractions, refetchCommunications, refetchNotes, refetchLoyalty]);

  const handleInteractionAdded = useCallback((newInteraction: Interaction) => {
    refetchInteractions();
  }, [refetchInteractions]);

  const handleCommunicationAdded = useCallback((newCommunication: CustomerCommunication) => {
    refetchCommunications();
  }, [refetchCommunications]);

  const handleNoteAdded = useCallback((newNote: CustomerNote) => {
    refetchNotes();
  }, [refetchNotes]);

  return {
    customer: customer || null,
    customerWorkOrders: customerWorkOrders || [],
    customerInteractions: customerInteractions || [],
    customerCommunications: customerCommunications || [],
    customerNotes: customerNotes || [],
    customerLoyalty: customerLoyalty || null,
    loading,
    error: error?.message || null,
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
