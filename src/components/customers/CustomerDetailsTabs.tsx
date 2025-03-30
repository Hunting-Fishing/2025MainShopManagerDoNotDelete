import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Customer } from "@/types/customer";
import { CustomerInteraction } from "@/types/interaction";
import { CustomerCommunication } from "@/types/customer";
import { AddCommunicationDialog } from "@/components/communications/AddCommunicationDialog";
import { CustomerNotes } from "@/components/customers/details/CustomerNotes";
import { CustomerWorkOrders } from "@/components/customers/details/CustomerWorkOrders";
import { CustomerDocuments } from "@/components/customers/details/CustomerDocuments";
import { CustomerAnalyticsSection } from './details/CustomerAnalyticsSection';

interface CustomerDetailsTabsProps {
  customer: Customer;
  customerWorkOrders: any[];
  customerInteractions: CustomerInteraction[];
  customerCommunications: CustomerCommunication[];
  customerNotes: any[];
  setAddInteractionOpen: (open: boolean) => void;
  onCommunicationAdded: (communication: CustomerCommunication) => void;
  onNoteAdded: (note: any) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const CustomerDetailsTabs: React.FC<CustomerDetailsTabsProps> = ({
  customer,
  customerWorkOrders,
  customerInteractions,
  customerCommunications,
  customerNotes,
  setAddInteractionOpen,
  onCommunicationAdded,
  onNoteAdded,
  activeTab,
  setActiveTab
}) => {
  const [addCommunicationOpen, setAddCommunicationOpen] = React.useState(false);

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
      <TabsList className="grid w-full md:w-auto md:inline-flex grid-cols-5 md:grid-cols-none h-auto">
        <TabsTrigger value="service">Service</TabsTrigger>
        <TabsTrigger value="interactions">Interactions</TabsTrigger>
        <TabsTrigger value="communications">Communications</TabsTrigger>
        <TabsTrigger value="documents">Documents</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
      </TabsList>
      
      <TabsContent value="service">
        <CustomerWorkOrders customer={customer} workOrders={customerWorkOrders} />
      </TabsContent>
      
      <TabsContent value="interactions">
        <div>
          {customerInteractions && customerInteractions.length > 0 ? (
            <ul>
              {customerInteractions.map((interaction) => (
                <li key={interaction.id}>{interaction.notes}</li>
              ))}
            </ul>
          ) : (
            <div>No interactions found.</div>
          )}
        </div>
      </TabsContent>
      
      <TabsContent value="communications">
        <AddCommunicationDialog
          open={addCommunicationOpen}
          onOpenChange={setAddCommunicationOpen}
          customerId={customer.id}
          onCommunicationAdded={onCommunicationAdded}
        />
        <div className="flex justify-end pb-4">
          <button onClick={() => setAddCommunicationOpen(true)} className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">Add Communication</button>
        </div>
        <div>
          {customerCommunications && customerCommunications.length > 0 ? (
            <ul>
              {customerCommunications.map((communication) => (
                <li key={communication.id}>{communication.content}</li>
              ))}
            </ul>
          ) : (
            <div>No communications found.</div>
          )}
        </div>
      </TabsContent>
      
      <TabsContent value="documents">
        <CustomerDocuments customer={customer} />
      </TabsContent>
      
      <TabsContent value="analytics">
        <CustomerAnalyticsSection customer={customer} />
      </TabsContent>
    </Tabs>
  );
};
