
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Customer, getCustomerFullName, createCustomerForUI } from "@/types/customer";
import { CustomerInteraction } from "@/types/interaction";
import { getCustomerById } from "@/services/customerService";
import { workOrders } from "@/data/workOrdersData";
import { getCustomerInteractions } from "@/data/interactionsData";
import { useToast } from "@/hooks/use-toast";
import { isValidUUID } from "@/utils/validators";

export const useCustomerDetails = (id: string | undefined) => {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [customerWorkOrders, setCustomerWorkOrders] = useState<any[]>([]);
  const [customerInteractions, setCustomerInteractions] = useState<CustomerInteraction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [addInteractionOpen, setAddInteractionOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();

  useEffect(() => {
    const fetchCustomerData = async () => {
      setLoading(true);
      try {
        if (!id) {
          navigate("/customers");
          return;
        }

        // Check if the ID is valid before fetching
        if (!isValidUUID(id)) {
          toast({
            title: "Invalid customer ID",
            description: "The requested customer ID is not valid.",
            variant: "destructive",
          });
          navigate("/customers");
          return;
        }

        const foundCustomer = await getCustomerById(id);
        
        if (foundCustomer) {
          setCustomer(foundCustomer);
          
          // Filter work orders for this customer
          // In a real implementation, we would fetch work orders from Supabase
          // Since we're still using mock work order data, we need to match on names
          const customerFullName = getCustomerFullName(foundCustomer);
          const filteredOrders = workOrders.filter(
            (order) => order.customer.toLowerCase() === customerFullName.toLowerCase()
          );
          
          setCustomerWorkOrders(filteredOrders);
          
          // Get customer interactions
          // Note: In a real implementation, we would fetch interactions from Supabase
          // The mock interaction data expects the old customer format, so we need to adapt
          const interactions = getCustomerInteractions(id);
          setCustomerInteractions(interactions);
        } else {
          toast({
            title: "Customer not found",
            description: "The requested customer could not be found.",
            variant: "destructive",
          });
          navigate("/customers");
        }
      } catch (error) {
        console.error("Error fetching customer data:", error);
        toast({
          title: "Error",
          description: "Failed to load customer details.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerData();
  }, [id, navigate, toast]);

  // Handle adding a new interaction
  const handleInteractionAdded = (interaction: CustomerInteraction) => {
    setCustomerInteractions([interaction, ...customerInteractions]);
  };

  // Create a backward compatible customer object for components that expect the old format
  const adaptedCustomer = customer 
    ? createCustomerForUI(customer, {
        lastServiceDate: customerWorkOrders.length > 0 ? customerWorkOrders[0].date : undefined,
        status: 'active'
      })
    : null;

  return {
    customer: adaptedCustomer,
    customerWorkOrders,
    customerInteractions,
    loading,
    addInteractionOpen,
    setAddInteractionOpen,
    activeTab,
    setActiveTab,
    handleInteractionAdded
  };
};
