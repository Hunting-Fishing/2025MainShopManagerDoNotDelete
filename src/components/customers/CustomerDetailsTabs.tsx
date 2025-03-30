
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CustomerServiceTab } from "./CustomerServiceTab";
import { CustomerInteractionsTab } from "./CustomerInteractionsTab";
import { CustomerInfoCard } from "./CustomerInfoCard";
import { CustomerSummaryCard } from "./CustomerSummaryCard";
import { CustomerLoyaltyCard } from "./loyalty/CustomerLoyaltyCard";
import { CustomerServiceReminders } from "./CustomerServiceReminders";
import { Customer, CustomerCommunication } from "@/types/customer";
import { CommunicationHistory } from "./communications/CommunicationHistory";
import { CustomerNotesTimeline } from "./notes/CustomerNotesTimeline";

interface CustomerDetailsTabsProps {
  customer: Customer;
  customerWorkOrders: any[];
  customerInteractions: any[];
  customerCommunications: CustomerCommunication[];
  customerNotes: any[];
  setAddInteractionOpen: (open: boolean) => void;
  onCommunicationAdded: (communication: CustomerCommunication) => void;
  onNoteAdded: (note: any) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const CustomerDetailsTabs = ({ 
  customer, 
  customerWorkOrders = [],
  customerInteractions = [],
  customerCommunications = [],
  customerNotes = [],
  setAddInteractionOpen,
  onCommunicationAdded,
  onNoteAdded,
  activeTab,
  setActiveTab
}: CustomerDetailsTabsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="service">Service History</TabsTrigger>
            <TabsTrigger value="interactions">Interactions</TabsTrigger>
            <TabsTrigger value="communications">Communications</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>
          <TabsContent value="service">
            <CustomerServiceTab 
              customer={customer} 
              customerWorkOrders={customerWorkOrders} 
            />
          </TabsContent>
          <TabsContent value="interactions">
            <CustomerInteractionsTab 
              customerInteractions={customerInteractions} 
              setAddInteractionOpen={setAddInteractionOpen} 
            />
          </TabsContent>
          <TabsContent value="communications">
            <CommunicationHistory 
              customer={customer}
              communications={customerCommunications}
              onCommunicationAdded={onCommunicationAdded}
            />
          </TabsContent>
          <TabsContent value="notes">
            <CustomerNotesTimeline 
              customer={customer}
              notes={customerNotes}
              onNoteAdded={onNoteAdded}
            />
          </TabsContent>
        </Tabs>
      </div>
      <div className="space-y-6">
        <CustomerInfoCard customer={customer} />
        <CustomerSummaryCard 
          customer={customer} 
          customerWorkOrders={customerWorkOrders} 
          customerInteractions={customerInteractions} 
          setActiveTab={setActiveTab} 
        />
        <CustomerLoyaltyCard customerId={customer.id} />
        <CustomerServiceReminders customer={customer} />
      </div>
    </div>
  );
};
