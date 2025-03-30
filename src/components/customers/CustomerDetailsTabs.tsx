
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CustomerServiceTab } from "./CustomerServiceTab";
import { CustomerInteractionsTab } from "./CustomerInteractionsTab";
import { CustomerInfoCard } from "./CustomerInfoCard";
import { CustomerSummaryCard } from "./CustomerSummaryCard";
import { CustomerLoyaltyCard } from "./loyalty/CustomerLoyaltyCard";
import { CustomerServiceReminders } from "./CustomerServiceReminders";
import { Customer } from "@/types/customer";

interface CustomerDetailsTabsProps {
  customer: Customer;
  onEdit?: () => void;
}

export const CustomerDetailsTabs = ({ customer, onEdit }: CustomerDetailsTabsProps) => {
  const [activeTab, setActiveTab] = useState("service");
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <Tabs defaultValue="service" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="service">Service History</TabsTrigger>
            <TabsTrigger value="interactions">Interactions</TabsTrigger>
          </TabsList>
          <TabsContent value="service">
            <CustomerServiceTab customer={customer} customerWorkOrders={[]} />
          </TabsContent>
          <TabsContent value="interactions">
            <CustomerInteractionsTab customerInteractions={[]} setAddInteractionOpen={() => {}} />
          </TabsContent>
        </Tabs>
      </div>
      <div className="space-y-6">
        <CustomerInfoCard customer={customer} />
        <CustomerSummaryCard 
          customer={customer} 
          customerWorkOrders={[]} 
          customerInteractions={[]} 
          setActiveTab={setActiveTab} 
        />
        <CustomerLoyaltyCard customerId={customer.id} />
        <CustomerServiceReminders customer={customer} />
      </div>
    </div>
  );
};
