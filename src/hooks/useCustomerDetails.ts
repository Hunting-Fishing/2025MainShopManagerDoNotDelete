
import { useState, useEffect, useCallback } from 'react';
import { Customer } from '@/types/customer';
import { WorkOrder } from '@/types/workOrder';
import { CustomerInteraction } from '@/types/interaction';
import { CustomerCommunication, CustomerNote } from '@/types/customer';
import { getAllCustomers } from '@/services/customer';
import { getWorkOrdersByCustomerId } from '@/services/workOrder';
import { getCustomerInteractions } from '@/services/customer/interactions/interactionQueryService';
import { getCustomerLoyalty, ensureCustomerLoyalty } from '@/services/loyalty/customerLoyaltyService';
import { CustomerLoyalty } from '@/types/loyalty';

export const useCustomerDetails = (customerId: string | undefined) => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [customerWorkOrders, setCustomerWorkOrders] = useState<WorkOrder[]>([]);
  const [customerInteractions, setCustomerInteractions] = useState<CustomerInteraction[]>([]);
  const [customerCommunications, setCustomerCommunications] = useState<CustomerCommunication[]>([]);
  const [customerNotes, setCustomerNotes] = useState<CustomerNote[]>([]);
  const [customerLoyalty, setCustomerLoyalty] = useState<CustomerLoyalty | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addInteractionOpen, setAddInteractionOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('vehicles');

  const refreshCustomerData = useCallback(async () => {
    if (!customerId || customerId === "undefined") {
      console.error('Invalid customer ID:', customerId);
      setError('Invalid customer ID provided');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('Fetching customer details for ID:', customerId);

      // Fetch customer data with retry logic
      let customerData: Customer | null = null;
      let retryCount = 0;
      const maxRetries = 3;

      while (!customerData && retryCount < maxRetries) {
        try {
          const customers = await getAllCustomers();
          customerData = customers.find(c => c.id === customerId) || null;
          
          if (!customerData) {
            console.warn(`Customer not found on attempt ${retryCount + 1}`);
            retryCount++;
            if (retryCount < maxRetries) {
              await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
            }
          }
        } catch (fetchError) {
          console.error(`Error fetching customers on attempt ${retryCount + 1}:`, fetchError);
          retryCount++;
          if (retryCount < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
          }
        }
      }

      if (!customerData) {
        throw new Error('Customer not found after multiple attempts');
      }

      setCustomer(customerData);

      // Fetch work orders with error handling
      try {
        console.log('Fetching work orders for customer:', customerId);
        const workOrders = await getWorkOrdersByCustomerId(customerId);
        console.log('Work orders fetched:', workOrders);
        setCustomerWorkOrders(workOrders || []);
      } catch (workOrderError) {
        console.error('Error fetching work orders:', workOrderError);
        setCustomerWorkOrders([]);
      }

      // Fetch interactions with error handling
      try {
        const interactions = await getCustomerInteractions(customerId);
        setCustomerInteractions(interactions || []);
      } catch (interactionError) {
        console.error('Error fetching interactions:', interactionError);
        setCustomerInteractions([]);
      }

      // Fetch loyalty data with auto-creation fallback
      try {
        console.log('Fetching loyalty data for customer:', customerId);
        const loyaltyData = await ensureCustomerLoyalty(customerId);
        setCustomerLoyalty(loyaltyData);
        console.log('Loyalty data fetched/created:', loyaltyData);
      } catch (loyaltyError) {
        console.error('Error fetching/creating loyalty data:', loyaltyError);
        setCustomerLoyalty(null);
      }

      // Initialize empty arrays for communications and notes
      setCustomerCommunications([]);
      setCustomerNotes([]);

    } catch (err: any) {
      console.error('Error in refreshCustomerData:', err);
      setError(err.message || 'Failed to load customer details');
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  const handleInteractionAdded = useCallback((interaction: CustomerInteraction) => {
    setCustomerInteractions(prev => [interaction, ...prev]);
    setAddInteractionOpen(false);
  }, []);

  const handleCommunicationAdded = useCallback((communication: CustomerCommunication) => {
    setCustomerCommunications(prev => [communication, ...prev]);
  }, []);

  const handleNoteAdded = useCallback((note: CustomerNote) => {
    setCustomerNotes(prev => [note, ...prev]);
  }, []);

  useEffect(() => {
    refreshCustomerData();
  }, [refreshCustomerData]);

  return {
    customer,
    customerWorkOrders,
    customerInteractions,
    customerCommunications,
    customerNotes,
    customerLoyalty,
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
