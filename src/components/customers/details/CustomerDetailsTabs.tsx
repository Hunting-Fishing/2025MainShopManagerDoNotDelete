
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Customer } from "@/types/customer";
import { CustomerInteraction } from "@/types/interaction";
import { CustomerInfoCard } from "../CustomerInfoCard";
import { CustomerSummaryCard } from "../CustomerSummaryCard";
import { CustomerInteractionsTab } from "../CustomerInteractionsTab";
import { CustomerServiceTab } from "../CustomerServiceTab";

interface CustomerDetailsTabsProps {
  customer: Customer & { name?: string, status?: string, lastServiceDate?: string };
  customerWorkOrders: any[];
  customerInteractions: CustomerInteraction[];
  setAddInteractionOpen: (open: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const CustomerDetailsTabs: React.FC<CustomerDetailsTabsProps> = ({
  customer,
  customerWorkOrders,
  customerInteractions,
  setAddInteractionOpen,
  activeTab,
  setActiveTab
}) => {
  return (
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
  );
};
