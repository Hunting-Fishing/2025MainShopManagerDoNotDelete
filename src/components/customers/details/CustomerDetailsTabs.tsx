import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CustomerProfileTab } from "./CustomerProfileTab";
import { CustomerVehiclesTab } from "./CustomerVehiclesTab";
import { CustomerNotesTab } from "./CustomerNotesTab";
import { CustomerWorkOrdersTab } from "./CustomerWorkOrdersTab";
import { CustomerHistoryTab } from "./CustomerHistoryTab";
import { CustomerCommunicationsTab } from "./CustomerCommunicationsTab";
import { Customer, CustomerCommunication, CustomerNote } from "@/types/customer";
import { WorkOrder } from "@/types/workOrder";
import { CustomerPaymentTab } from "./CustomerPaymentTab";
import { CreditCard, BarChart } from "lucide-react";
import { CustomerAnalyticsTab } from "./CustomerAnalyticsTab";

interface CustomerDetailsTabsProps {
  customer: Customer;
  customerWorkOrders: WorkOrder[];
  customerInteractions: any[];
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
  const tabs = [
    { id: "profile", label: "Profile" },
    { id: "vehicles", label: "Vehicles" },
    { id: "work-orders", label: "Work Orders" },
    { id: "payments", label: "Payments" },
    { id: "history", label: "Activity" },
    { id: "communications", label: "Communications" },
    { id: "notes", label: "Notes" },
    { id: "analytics", label: "Analytics" }
  ];

  return (
    <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid grid-cols-4 md:grid-cols-8">
        {tabs.map(tab => (
          <TabsTrigger key={tab.id} value={tab.id}>
            {tab.id === 'payments' && <CreditCard className="h-4 w-4 mr-2 md:hidden" />}
            {tab.id === 'analytics' && <BarChart className="h-4 w-4 mr-2 md:hidden" />}
            <span className={tab.id === 'payments' || tab.id === 'analytics' ? "hidden md:inline" : ""}>{tab.label}</span>
          </TabsTrigger>
        ))}
      </TabsList>
      
      <TabsContent value="profile" className="space-y-6 pt-4">
        <CustomerProfileTab customer={customer} />
      </TabsContent>

      <TabsContent value="vehicles" className="space-y-4 pt-4">
        <CustomerVehiclesTab customer={customer} />
      </TabsContent>

      <TabsContent value="work-orders" className="space-y-4 pt-4">
        <CustomerWorkOrdersTab 
          customer={customer} 
          workOrders={customerWorkOrders} 
        />
      </TabsContent>
      
      <TabsContent value="payments" className="pt-4">
        <CustomerPaymentTab customer={customer} />
      </TabsContent>

      <TabsContent value="history" className="space-y-4 pt-4">
        <CustomerHistoryTab
          customer={customer}
          interactions={customerInteractions}
          onAddInteraction={() => setAddInteractionOpen(true)}
        />
      </TabsContent>
      
      <TabsContent value="communications" className="space-y-4 pt-4">
        <CustomerCommunicationsTab
          customer={customer}
          communications={customerCommunications}
          onCommunicationAdded={onCommunicationAdded}
        />
      </TabsContent>
      
      <TabsContent value="notes" className="space-y-4 pt-4">
        <CustomerNotesTab 
          customer={customer} 
          notes={customerNotes} 
          onNoteAdded={onNoteAdded}
        />
      </TabsContent>

      <TabsContent value="analytics" className="space-y-4 pt-4">
        <CustomerAnalyticsTab customer={customer} />
      </TabsContent>
    </Tabs>
  );
}
