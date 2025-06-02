
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getCustomerById } from '@/services/customer/customerQueryService';
import { getWorkOrdersByCustomerId } from '@/services/workOrder';
import { useCustomerLoyalty } from '@/hooks/useCustomerLoyalty';
import { Customer, CustomerCommunication, CustomerNote } from '@/types/customer';
import { CustomerInteraction } from '@/types/interaction';
import { WorkOrder } from '@/types/workOrder';

export const useCustomerDetails = (customerId: string | undefined) => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [customerWorkOrders, setCustomerWorkOrders] = useState<WorkOrder[]>([]);
  const [customerInteractions, setCustomerInteractions] = useState<CustomerInteraction[]>([]);
  const [customerCommunications, setCustomerCommunications] = useState<CustomerCommunication[]>([]);
  const [customerNotes, setCustomerNotes] = useState<CustomerNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [workOrdersLoading, setWorkOrdersLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [workOrdersError, setWorkOrdersError] = useState<string | null>(null);
  const [addInteractionOpen, setAddInteractionOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("service");

  const { toast } = useToast();
  
  // Use the loyalty hook
  const { customerLoyalty, loading: loyaltyLoading, refreshLoyalty } = useCustomerLoyalty(customerId);

  const fetchCustomerData = useCallback(async () => {
    if (!customerId || customerId === "undefined") {
      setError("Invalid customer ID");
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching customer data for ID:', customerId);
      setLoading(true);
      setError(null);
      
      const customerData = await getCustomerById(customerId);
      
      if (!customerData) {
        setError("Customer not found");
        setCustomer(null);
      } else {
        console.log('Customer data loaded:', customerData);
        setCustomer(customerData);
      }
    } catch (err) {
      console.error('Error fetching customer:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load customer';
      setError(errorMessage);
      setCustomer(null);
      
      toast({
        title: "Error",
        description: "Failed to load customer details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [customerId, toast]);

  const fetchWorkOrders = useCallback(async () => {
    if (!customerId || customerId === "undefined") {
      setWorkOrdersLoading(false);
      return;
    }

    try {
      console.log('Fetching work orders for customer:', customerId);
      setWorkOrdersLoading(true);
      setWorkOrdersError(null);
      
      const workOrders = await getWorkOrdersByCustomerId(customerId);
      console.log('Work orders loaded:', workOrders);
      setCustomerWorkOrders(workOrders || []);
    } catch (err) {
      console.error('Error fetching work orders:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load work orders';
      setWorkOrdersError(errorMessage);
      setCustomerWorkOrders([]);
      
      toast({
        title: "Warning",
        description: "Failed to load work orders for this customer.",
        variant: "destructive",
      });
    } finally {
      setWorkOrdersLoading(false);
    }
  }, [customerId, toast]);

  const refreshCustomerData = useCallback(async () => {
    await Promise.all([
      fetchCustomerData(),
      fetchWorkOrders(),
      refreshLoyalty()
    ]);
  }, [fetchCustomerData, fetchWorkOrders, refreshLoyalty]);

  // Initial data fetch
  useEffect(() => {
    fetchCustomerData();
    fetchWorkOrders();
  }, [fetchCustomerData, fetchWorkOrders]);

  const handleInteractionAdded = useCallback((interaction: CustomerInteraction) => {
    setCustomerInteractions(prev => [interaction, ...prev]);
    setAddInteractionOpen(false);
    
    toast({
      title: "Success",
      description: "Interaction added successfully",
    });
  }, [toast]);

  const handleCommunicationAdded = useCallback((communication: CustomerCommunication) => {
    setCustomerCommunications(prev => [communication, ...prev]);
    
    toast({
      title: "Success", 
      description: "Communication added successfully",
    });
  }, [toast]);

  const handleNoteAdded = useCallback((note: CustomerNote) => {
    setCustomerNotes(prev => [note, ...prev]);
    
    toast({
      title: "Success",
      description: "Note added successfully", 
    });
  }, [toast]);

  return {
    customer,
    customerWorkOrders,
    customerInteractions,
    customerCommunications,
    customerNotes,
    customerLoyalty,
    loading,
    workOrdersLoading,
    loyaltyLoading,
    error,
    workOrdersError,
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
