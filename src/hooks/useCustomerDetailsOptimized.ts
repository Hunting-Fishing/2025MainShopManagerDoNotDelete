
import { useState, useEffect } from 'react';
import { Customer } from '@/types/customer';
import { WorkOrder } from '@/types/workOrder';
import { getCustomerById } from '@/services/customer/customerQueryService';
import { getWorkOrdersByCustomerId } from '@/services/workOrder/workOrderQueryService';

export const useCustomerDetailsOptimized = (customerId: string) => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCustomerDetails = async () => {
      if (!customerId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Fetch customer data and work orders in parallel
        const [customerData, workOrdersData] = await Promise.all([
          getCustomerById(customerId),
          getWorkOrdersByCustomerId(customerId)
        ]);
        
        setCustomer(customerData);
        setWorkOrders(workOrdersData);
        
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
    loading,
    error,
    refetch: () => {
      // Re-fetch data when needed
      if (customerId) {
        const fetchData = async () => {
          try {
            setLoading(true);
            const [customerData, workOrdersData] = await Promise.all([
              getCustomerById(customerId),
              getWorkOrdersByCustomerId(customerId)
            ]);
            setCustomer(customerData);
            setWorkOrders(workOrdersData);
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
