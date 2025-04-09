
import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Customer, CustomerCommunication, CustomerNote } from "@/types/customer";
import { CustomerInteraction } from "@/types/interaction";
import { CustomerInfoCard } from "../CustomerInfoCard";
import { EnhancedCustomerPreview } from "../EnhancedCustomerPreview";
import { CustomerInteractionsTab } from "../CustomerInteractionsTab";
import { CustomerServiceTab } from "../CustomerServiceTab";
import { CustomerNotesTimeline } from "../notes/CustomerNotesTimeline";
import { CommunicationHistory } from "../communications/CommunicationHistory";
import { CustomerVehiclesTab } from "../vehicles/CustomerVehiclesTab";
import { getCustomerNotes } from "@/services/customers";
import { Car, FileText } from "lucide-react";
import { CustomerSummaryCard } from "../CustomerSummaryCard";
import { CustomerDocumentsTab } from "../documents/CustomerDocumentsTab";

interface CustomerDetailsTabsProps {
  customer: Customer & { name?: string, status?: string, lastServiceDate?: string };
  customerWorkOrders: any[];
  customerInteractions: CustomerInteraction[];
  customerCommunications: CustomerCommunication[];
  customerNotes: CustomerNote[];
  setAddInteractionOpen: (open: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onCommunicationAdded: (communication: CustomerCommunication) => void;
  onNoteAdded: (note: CustomerNote) => void;
}

export const CustomerDetailsTabs: React.FC<CustomerDetailsTabsProps> = ({
  customer,
  customerWorkOrders,
  customerInteractions,
  customerCommunications,
  customerNotes,
  setAddInteractionOpen,
  activeTab,
  setActiveTab,
  onCommunicationAdded,
  onNoteAdded
}) => {
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  // Check if there's a tab in the URL and use it
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams, setActiveTab]);

  // Update URL when tab changes
  useEffect(() => {
    if (activeTab !== 'overview') {
      setSearchParams({ tab: activeTab });
    } else {
      setSearchParams({});
    }
  }, [activeTab, setSearchParams]);

  // Calculate the number of vehicles for the badge
  const vehicleCount = customer.vehicles?.length || 0;
  
  return (
    <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="overflow-x-auto">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="vehicles">
          Vehicles
          {vehicleCount > 0 && (
            <Badge className="ml-2 bg-amber-100 text-amber-800">{vehicleCount}</Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="documents">
          Documents
        </TabsTrigger>
        <TabsTrigger value="notes">
          Notes
          {customerNotes.length > 0 && (
            <Badge className="ml-2 bg-blue-100 text-blue-800">{customerNotes.length}</Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="communications">
          Communications
          {customerCommunications.length > 0 && (
            <Badge className="ml-2 bg-green-100 text-green-800">{customerC ommunications.length}</Badge>
          )}
        </TabsTrigger>
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
      
      <TabsContent value="vehicles" className="mt-6">
        <CustomerVehiclesTab customer={customer} />
      </TabsContent>
      
      <TabsContent value="documents" className="mt-6">
        <CustomerDocumentsTab customer={customer} />
      </TabsContent>
      
      <TabsContent value="notes" className="mt-6">
        <CustomerNotesTimeline
          customer={customer}
          notes={customerNotes}
          onNoteAdded={onNoteAdded}
          isLoading={isLoadingNotes}
        />
      </TabsContent>
      
      <TabsContent value="communications" className="mt-6">
        <CommunicationHistory
          customer={customer}
          communications={customerCommunications}
          onCommunicationAdded={onCommunicationAdded}
        />
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
