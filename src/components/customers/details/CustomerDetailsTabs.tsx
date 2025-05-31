
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Customer, CustomerNote } from "@/types/customer";
import { WorkOrder } from "@/types/workOrder";
import { CustomerInteraction } from "@/types/interaction";
import { CustomerCommunication } from "@/types/customer";
import { CustomerVehiclesTab } from "./CustomerVehiclesTab";
import { CustomerWorkOrdersTab } from "./CustomerWorkOrdersTab";
import { CustomerInteractionsTab } from "./CustomerInteractionsTab";
import { CustomerCommunicationsTab } from "./CustomerCommunicationsTab";
import { CustomerNotesTab } from "./CustomerNotesTab";
import { CustomerFormsTab } from "@/components/customers/forms/CustomerFormsTab";

interface CustomerDetailsTabsProps {
  customer: Customer;
  customerWorkOrders: WorkOrder[];
  customerInteractions: CustomerInteraction[];
  customerCommunications: CustomerCommunication[];
  customerNotes: CustomerNote[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  setAddInteractionOpen: (open: boolean) => void;
  onCommunicationAdded?: () => void;
  onNoteAdded?: () => void;
}

export function CustomerDetailsTabs({
  customer,
  customerWorkOrders,
  customerInteractions,
  customerCommunications,
  customerNotes,
  activeTab,
  setActiveTab,
  setAddInteractionOpen,
  onCommunicationAdded,
  onNoteAdded
}: CustomerDetailsTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid grid-cols-6 mb-6">
        <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
        <TabsTrigger value="work-orders">Work Orders</TabsTrigger>
        <TabsTrigger value="interactions">Interactions</TabsTrigger>
        <TabsTrigger value="communications">Communications</TabsTrigger>
        <TabsTrigger value="notes">Notes</TabsTrigger>
        <TabsTrigger value="forms">Forms</TabsTrigger>
      </TabsList>

      <TabsContent value="vehicles">
        <CustomerVehiclesTab customer={customer} />
      </TabsContent>

      <TabsContent value="work-orders">
        <CustomerWorkOrdersTab 
          customer={customer} 
          workOrders={customerWorkOrders} 
        />
      </TabsContent>

      <TabsContent value="interactions">
        <CustomerInteractionsTab 
          customer={customer}
          interactions={customerInteractions}
          setAddInteractionOpen={setAddInteractionOpen}
        />
      </TabsContent>

      <TabsContent value="communications">
        <CustomerCommunicationsTab 
          customer={customer}
          communications={customerCommunications}
          onCommunicationAdded={onCommunicationAdded}
        />
      </TabsContent>

      <TabsContent value="notes">
        <CustomerNotesTab 
          customer={customer}
          notes={customerNotes}
          onNoteAdded={onNoteAdded}
        />
      </TabsContent>

      <TabsContent value="forms">
        <CustomerFormsTab customer={customer} />
      </TabsContent>
    </Tabs>
  );
}
