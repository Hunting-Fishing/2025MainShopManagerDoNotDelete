
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Customer } from '@/types/customer';
import { WorkOrder } from '@/types/workOrder';
import { CustomerInteraction } from '@/types/interaction';
import { CustomerCommunication, CustomerNote } from '@/types/customer';
import { getAllCustomers } from '@/services/customer';
import { getWorkOrdersByCustomerId } from '@/services/workOrder';
import { getCustomerInteractions } from '@/services/customer/interactions/interactionQueryService';
import { ensureCustomerLoyalty } from '@/services/loyalty/customerLoyaltyService';
import { CustomerLoyalty } from '@/types/loyalty';

// Global state to prevent duplicate requests
const activeRequests = new Map<string, Promise<any>>();
const requestResults = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 30000; // 30 seconds

interface UseCustomerDetailsOptions {
  enableCaching?: boolean;
  cacheTimeout?: number;
}

export const useCustomerDetailsOptimized = (
  customerId: string | undefined,
  options: UseCustomerDetailsOptions = {}
) => {
  const { enableCaching = true, cacheTimeout = CACHE_DURATION } = options;

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

  // Memoized fetch functions to prevent unnecessary recreations
  const fetchWithCache = useCallback(async <T>(
    key: string,
    fetchFn: () => Promise<T>
  ): Promise<T> => {
    if (enableCaching) {
      // Check cache first
      const cached = requestResults.get(key);
      if (cached && Date.now() - cached.timestamp < cacheTimeout) {
        console.log(`Using cached data for: ${key}`);
        return cached.data;
      }

      // Check if request is already in progress
      if (activeRequests.has(key)) {
        console.log(`Request already in progress for: ${key}`);
        return activeRequests.get(key)!;
      }
    }

    // Execute the request
    const request = fetchFn();
    if (enableCaching) {
      activeRequests.set(key, request);
    }

    try {
      const result = await request;
      if (enableCaching) {
        requestResults.set(key, { data: result, timestamp: Date.now() });
        activeRequests.delete(key);
      }
      return result;
    } catch (err) {
      if (enableCaching) {
        activeRequests.delete(key);
      }
      throw err;
    }
  }, [enableCaching, cacheTimeout]);

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

      // Fetch customer data
      const customerData = await fetchWithCache(
        `customer_${customerId}`,
        async () => {
          const customers = await getAllCustomers();
          const found = customers.find(c => c.id === customerId);
          if (!found) {
            throw new Error('Customer not found');
          }
          return found;
        }
      );

      setCustomer(customerData);

      // Fetch work orders
      try {
        const workOrders = await fetchWithCache(
          `workorders_${customerId}`,
          () => getWorkOrdersByCustomerId(customerId)
        );
        console.log('Work orders fetched:', workOrders);
        setCustomerWorkOrders(workOrders || []);
      } catch (workOrderError) {
        console.error('Error fetching work orders:', workOrderError);
        setCustomerWorkOrders([]);
      }

      // Fetch interactions
      try {
        const interactions = await fetchWithCache(
          `interactions_${customerId}`,
          () => getCustomerInteractions(customerId)
        );
        setCustomerInteractions(interactions || []);
      } catch (interactionError) {
        console.error('Error fetching interactions:', interactionError);
        setCustomerInteractions([]);
      }

      // Fetch loyalty data
      try {
        console.log('Fetching loyalty data for customer:', customerId);
        const loyaltyData = await fetchWithCache(
          `loyalty_${customerId}`,
          () => ensureCustomerLoyalty(customerId)
        );
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
  }, [customerId, fetchWithCache]);

  // Optimized handlers
  const handleInteractionAdded = useCallback((interaction: CustomerInteraction) => {
    setCustomerInteractions(prev => [interaction, ...prev]);
    setAddInteractionOpen(false);
    // Clear cache to ensure fresh data on next load
    if (customerId) {
      requestResults.delete(`interactions_${customerId}`);
    }
  }, [customerId]);

  const handleCommunicationAdded = useCallback((communication: CustomerCommunication) => {
    setCustomerCommunications(prev => [communication, ...prev]);
  }, []);

  const handleNoteAdded = useCallback((note: CustomerNote) => {
    setCustomerNotes(prev => [note, ...prev]);
  }, []);

  // Clear cache when customer changes
  useEffect(() => {
    if (customerId && customerId !== "undefined") {
      // Clear old cache entries for this customer when switching
      const keysToDelete = Array.from(requestResults.keys()).filter(key => 
        key.includes(customerId)
      );
      keysToDelete.forEach(key => requestResults.delete(key));
    }
  }, [customerId]);

  // Single effect to fetch data
  useEffect(() => {
    refreshCustomerData();
  }, [refreshCustomerData]);

  // Memoized return value to prevent unnecessary re-renders
  return useMemo(() => ({
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
  }), [
    customer,
    customerWorkOrders,
    customerInteractions,
    customerCommunications,
    customerNotes,
    customerLoyalty,
    loading,
    error,
    addInteractionOpen,
    activeTab,
    refreshCustomerData,
    handleInteractionAdded,
    handleCommunicationAdded,
    handleNoteAdded
  ]);
};
