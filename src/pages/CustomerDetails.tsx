
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { findCustomerById } from "@/data/customersData";
import { Customer } from "@/types/customer";
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
import { toast } from "@/hooks/use-toast";

export default function CustomerDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [customerWorkOrders, setCustomerWorkOrders] = useState([]);
  const [customerInteractions, setCustomerInteractions] = useState<CustomerInteraction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [addInteractionOpen, setAddInteractionOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchCustomerData = () => {
      setLoading(true);
      try {
        if (!id) {
          navigate("/customers");
          return;
        }

        const foundCustomer = findCustomerById(id);
        
        if (foundCustomer) {
          setCustomer(foundCustomer);
          
          // Filter work orders for this customer
          const filteredOrders = workOrders.filter(
            (order) => order.customer.toLowerCase() === foundCustomer.name.toLowerCase()
          );
          
          setCustomerWorkOrders(filteredOrders);
          
          // Get customer interactions
          const interactions = getCustomerInteractions(foundCustomer.id);
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
  }, [id, navigate]);

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

  return (
    <div className="space-y-6">
      <CustomerHeader 
        customer={customer}
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
            <CustomerInfoCard customer={customer} />
            <CustomerSummaryCard 
              customer={customer}
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
            customer={customer}
            customerWorkOrders={customerWorkOrders}
          />
        </TabsContent>
      </Tabs>
      
      {customer && (
        <AddInteractionDialog
          customer={customer}
          open={addInteractionOpen}
          onOpenChange={setAddInteractionOpen}
          onInteractionAdded={handleInteractionAdded}
        />
      )}
    </div>
  );
}
