
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Customer, getCustomerFullName, createCustomerForUI } from "@/types/customer";
import { getCustomerById } from "@/services/customerService";
import { workOrders } from "@/data/workOrdersData";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CustomerInteraction } from "@/types/interaction";
import { getCustomerInteractions } from "@/data/interactionsData";
import { AddInteractionDialog } from "@/components/interactions/AddInteractionDialog";
import { CustomerHeader } from "@/components/customers/CustomerHeader";
import { CustomerInfoCard } from "@/components/customers/CustomerInfoCard";
import { CustomerSummaryCard } from "@/components/customers/CustomerSummaryCard";
import { CustomerInteractionsTab } from "@/components/customers/CustomerInteractionsTab";
import { CustomerServiceTab } from "@/components/customers/CustomerServiceTab";
import { useToast } from "@/hooks/use-toast";
import { isValidUUID } from "@/utils/validators";

export default function CustomerDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [customerWorkOrders, setCustomerWorkOrders] = useState([]);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="text-lg text-slate-500">Loading customer details...</div>
      </div>
    );
  }

  if (!customer) {
    return null;
  }

  // Create a backward compatible customer object for components that expect the old format
  const adaptedCustomer = createCustomerForUI(customer, {
    lastServiceDate: customerWorkOrders.length > 0 ? customerWorkOrders[0].date : undefined,
    status: 'active'
  });

  return (
    <div className="space-y-6">
      <CustomerHeader 
        customer={adaptedCustomer}
        setAddInteractionOpen={setAddInteractionOpen}
      />

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="interactions">
            Interaction History 
            {customerInteractions.length > 0 && (
              <Badge className="ml-2 bg-blue-100 text-blue-800">{customerInteractions.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="service">Service History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <CustomerInfoCard customer={adaptedCustomer} />
            <CustomerSummaryCard 
              customer={adaptedCustomer}
              customerWorkOrders={customerWorkOrders}
              customerInteractions={customerInteractions}
              setActiveTab={setActiveTab}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="interactions" className="mt-6">
          <CustomerInteractionsTab
            customerInteractions={customerInteractions}
            setAddInteractionOpen={setAddInteractionOpen}
          />
        </TabsContent>
        
        <TabsContent value="service" className="mt-6">
          <CustomerServiceTab
            customer={adaptedCustomer}
            customerWorkOrders={customerWorkOrders}
          />
        </TabsContent>
      </Tabs>
      
      {customer && (
        <AddInteractionDialog
          customer={adaptedCustomer}
          open={addInteractionOpen}
          onOpenChange={setAddInteractionOpen}
          onInteractionAdded={handleInteractionAdded}
        />
      )}
    </div>
  );
}
