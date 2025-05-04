
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Customer, CustomerNote } from "@/types/customer";
import { WorkOrder } from "@/types/workOrder";
import { CustomerInteraction } from "@/types/interaction";
import { CustomerCommunication } from "@/types/customer";
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
        <div className="text-center py-8 text-muted-foreground">
          Vehicle list component will be displayed here
        </div>
      </TabsContent>

      <TabsContent value="work-orders">
        <div className="text-center py-8 text-muted-foreground">
          Work orders list component will be displayed here
        </div>
      </TabsContent>

      <TabsContent value="interactions">
        <div className="text-center py-8 text-muted-foreground">
          Interactions component will be displayed here
        </div>
      </TabsContent>

      <TabsContent value="communications">
        <div className="text-center py-8 text-muted-foreground">
          Communications component will be displayed here
        </div>
      </TabsContent>

      <TabsContent value="notes">
        <div className="text-center py-8 text-muted-foreground">
          Notes component will be displayed here
        </div>
      </TabsContent>

      <TabsContent value="forms">
        <CustomerFormsTab customer={customer} />
      </TabsContent>
    </Tabs>
  );
}
