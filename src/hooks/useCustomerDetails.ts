
import { useState, useEffect, useCallback } from 'react';
import { Customer } from '@/types/customer';
import { WorkOrder } from '@/types/workOrder';
import { CustomerInteraction } from '@/types/interaction';
import { CustomerCommunication, CustomerNote } from '@/types/customer';
import { getCustomerById } from '@/services/customer';
import { getWorkOrdersByCustomerId } from '@/services/workOrder';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useCustomerDetails(customerId?: string) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [customerWorkOrders, setCustomerWorkOrders] = useState<WorkOrder[]>([]);
  const [customerInteractions, setCustomerInteractions] = useState<CustomerInteraction[]>([]);
  const [customerCommunications, setCustomerCommunications] = useState<CustomerCommunication[]>([]);
  const [customerNotes, setCustomerNotes] = useState<CustomerNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addInteractionOpen, setAddInteractionOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('vehicles');
  const { toast } = useToast();

  const fetchCustomerData = useCallback(async () => {
    if (!customerId || customerId === "undefined") {
      setError("Invalid customer ID");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('Fetching customer data for ID:', customerId);

      // Fetch customer basic info
      const customerData = await getCustomerById(customerId);
      if (!customerData) {
        throw new Error('Customer not found');
      }
      setCustomer(customerData);

      // Fetch work orders
      const workOrders = await getWorkOrdersByCustomerId(customerId);
      console.log('Work orders fetched:', workOrders);
      setCustomerWorkOrders(workOrders || []);

      // Fetch customer communications
      try {
        const { data: communications, error: commError } = await supabase
          .from('customer_communications')
          .select('*')
          .eq('customer_id', customerId)
          .order('created_at', { ascending: false });
        
        if (commError) {
          console.error('Error fetching communications:', commError);
        } else {
          setCustomerCommunications(communications || []);
        }
      } catch (err) {
        console.error('Communications fetch error:', err);
        setCustomerCommunications([]);
      }

      // Fetch customer interactions
      try {
        const { data: interactions, error: intError } = await supabase
          .from('customer_interactions')
          .select('*')
          .eq('customer_id', customerId)
          .order('created_at', { ascending: false });
        
        if (intError) {
          console.error('Error fetching interactions:', intError);
        } else {
          setCustomerInteractions(interactions || []);
        }
      } catch (err) {
        console.error('Interactions fetch error:', err);
        setCustomerInteractions([]);
      }

      // Fetch customer notes
      try {
        const { data: notes, error: notesError } = await supabase
          .from('customer_notes')
          .select('*')
          .eq('customer_id', customerId)
          .order('created_at', { ascending: false });
        
        if (notesError) {
          console.error('Error fetching notes:', notesError);
        } else {
          setCustomerNotes(notes || []);
        }
      } catch (err) {
        console.error('Notes fetch error:', err);
        setCustomerNotes([]);
      }

    } catch (err: any) {
      console.error('Error fetching customer data:', err);
      setError(err.message || 'Failed to load customer data');
      toast({
        title: "Error",
        description: "Failed to load customer data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [customerId, toast]);

  useEffect(() => {
    fetchCustomerData();
  }, [fetchCustomerData]);

  const refreshCustomerData = useCallback(() => {
    fetchCustomerData();
  }, [fetchCustomerData]);

  const handleInteractionAdded = useCallback((interaction: CustomerInteraction) => {
    setCustomerInteractions(prev => [interaction, ...prev]);
    setAddInteractionOpen(false);
    toast({
      title: "Success",
      description: "Interaction added successfully"
    });
  }, [toast]);

  const handleCommunicationAdded = useCallback((communication: CustomerCommunication) => {
    setCustomerCommunications(prev => [communication, ...prev]);
    toast({
      title: "Success", 
      description: "Communication added successfully"
    });
  }, [toast]);

  const handleNoteAdded = useCallback((note: CustomerNote) => {
    setCustomerNotes(prev => [note, ...prev]);
    toast({
      title: "Success",
      description: "Note added successfully"
    });
  }, [toast]);

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
}
