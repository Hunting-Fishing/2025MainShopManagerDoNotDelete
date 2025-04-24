
import { useState, useEffect, useCallback } from 'react';
import { getCustomerById, getCustomer } from '@/services/customer';
import { Customer, CustomerCommunication, CustomerNote } from '@/types/customer';
import { WorkOrder } from '@/types/workOrder';
import { CustomerInteraction } from '@/types/interaction';

export const useCustomerDetails = (customerId?: string) => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [customerWorkOrders, setCustomerWorkOrders] = useState<WorkOrder[]>([]);
  const [customerInteractions, setCustomerInteractions] = useState<CustomerInteraction[]>([]);
  const [customerCommunications, setCustomerCommunications] = useState<CustomerCommunication[]>([]);
  const [customerNotes, setCustomerNotes] = useState<CustomerNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addInteractionOpen, setAddInteractionOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  // Function to refresh customer data
  const refreshCustomerData = useCallback(async () => {
    if (!customerId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Fetch customer details
      const customerData = await getCustomerById(customerId);
      
      if (!customerData) {
        setError('Customer not found');
        setLoading(false);
        return;
      }
      
      setCustomer(customerData);
      
      // Fetch work orders for this customer
      // This is a placeholder - in a real app, you'd fetch this data from your API
      setCustomerWorkOrders([]);
      
      // Fetch interactions
      setCustomerInteractions([]);
      
      // Fetch communications
      setCustomerCommunications([]);
      
      // Fetch notes
      setCustomerNotes([]);
      
    } catch (err: any) {
      console.error('Error fetching customer details:', err);
      setError(err.message || 'Failed to load customer details');
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  // Load customer data when component mounts or ID changes
  useEffect(() => {
    if (customerId) {
      refreshCustomerData();
    }
  }, [customerId, refreshCustomerData]);

  // Handle adding a new interaction
  const handleInteractionAdded = useCallback((interaction: CustomerInteraction) => {
    setCustomerInteractions(prev => [interaction, ...prev]);
  }, []);

  // Handle adding a new communication
  const handleCommunicationAdded = useCallback((communication: CustomerCommunication) => {
    setCustomerCommunications(prev => [communication, ...prev]);
  }, []);

  // Handle adding a new note
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
