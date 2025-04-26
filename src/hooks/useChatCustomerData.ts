
import { useState, useEffect } from "react";
import { getCustomerDataForChat } from "@/services/chat/chatCustomerService";
import { Customer } from "@/types/customer";
import { WorkOrder } from "@/types/workOrder";

// Import Vehicle directly from types/vehicle.ts instead of types/customer/vehicle
import { Vehicle } from "@/types/vehicle";

interface UseChatCustomerDataProps {
  customerId?: string | null;
}

export const useChatCustomerData = ({ customerId }: UseChatCustomerDataProps) => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!customerId) {
        setCustomer(null);
        setVehicles([]);
        setWorkOrders([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await getCustomerDataForChat(customerId);
        setCustomer(data.customer);
        setVehicles(data.vehicles);
        setWorkOrders(data.workOrders);
      } catch (err) {
        console.error("Error fetching customer data:", err);
        setError("Failed to load customer details");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [customerId]);

  const refreshData = async () => {
    if (!customerId) return;
    
    setLoading(true);
    setError(null);

    try {
      const data = await getCustomerDataForChat(customerId);
      setCustomer(data.customer);
      setVehicles(data.vehicles);
      setWorkOrders(data.workOrders);
    } catch (err) {
      console.error("Error refreshing customer data:", err);
      setError("Failed to refresh customer details");
    } finally {
      setLoading(false);
    }
  };

  return {
    customer,
    vehicles,
    workOrders,
    loading,
    error,
    refreshData
  };
};
