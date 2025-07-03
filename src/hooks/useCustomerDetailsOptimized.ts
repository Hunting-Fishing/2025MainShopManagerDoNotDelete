
import { useState, useEffect } from 'react';
import { Customer, CustomerNote } from '@/types/customer';
import { WorkOrder } from '@/types/workOrder';
import { CustomerLoyalty } from '@/types/loyalty';
import { getCustomerById } from '@/services/customer/customerQueryService';
import { getWorkOrdersByCustomerId } from '@/services/workOrder/workOrderQueryService';
import { getCustomerNotes } from '@/services/customer/customerNotesService';
import { getCustomerLoyalty } from '@/services/loyalty/customerLoyaltyService';

export const useCustomerDetailsOptimized = (customerId: string) => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [customerNotes, setCustomerNotes] = useState<CustomerNote[]>([]);
  const [customerLoyalty, setCustomerLoyalty] = useState<CustomerLoyalty | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCustomerDetails = async () => {
      if (!customerId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Fetch customer data, work orders, notes, and loyalty in parallel
        const [customerData, workOrdersData, notesData, loyaltyData] = await Promise.all([
          getCustomerById(customerId),
          getWorkOrdersByCustomerId(customerId),
          getCustomerNotes(customerId),
          getCustomerLoyalty(customerId)
        ]);
        
        setCustomer(customerData);
        setWorkOrders(workOrdersData);
        setCustomerNotes(notesData);
        setCustomerLoyalty(loyaltyData);
        
      } catch (err) {
        console.error('Error fetching customer details:', err);
        setError(err instanceof Error ? err.message : 'Failed to load customer details');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerDetails();
  }, [customerId]);

  return {
    customer,
    workOrders,
    customerNotes,
    customerLoyalty,
    loading,
    error,
    refetch: () => {
      // Re-fetch data when needed
      if (customerId) {
        const fetchData = async () => {
          try {
            setLoading(true);
            const [customerData, workOrdersData, notesData, loyaltyData] = await Promise.all([
              getCustomerById(customerId),
              getWorkOrdersByCustomerId(customerId),
              getCustomerNotes(customerId),
              getCustomerLoyalty(customerId)
            ]);
            setCustomer(customerData);
            setWorkOrders(workOrdersData);
            setCustomerNotes(notesData);
            setCustomerLoyalty(loyaltyData);
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to refresh data');
          } finally {
            setLoading(false);
          }
        };
        fetchData();
      }
    }
  };
};
