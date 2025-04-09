
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
import { Car } from "lucide-react";

interface CustomerDetailsTabsProps {
  customer: Customer & { name?: string, status?: string, lastServiceDate?: string };
  customerWorkOrders: any[];
  customerInteractions: CustomerInteraction[];
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
  setAddInteractionOpen,
  activeTab,
  setActiveTab,
  onCommunicationAdded,
  onNoteAdded
}) => {
  // Initialize state with empty arrays
  const [notes, setNotes] = useState<CustomerNote[]>([]);
  const [communications, setCommunications] = useState<CustomerCommunication[]>([]);
  const [isLoadingNotes, setIsLoadingNotes] = useState(true);
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

  // Load notes when tab changes to notes or on initial load
  useEffect(() => {
    if (activeTab === 'notes' || activeTab === 'overview') {
      loadNotes();
    }
  }, [activeTab, customer.id]);

  const loadNotes = async () => {
    try {
      setIsLoadingNotes(true);
      const loadedNotes = await getCustomerNotes(customer.id);
      setNotes(loadedNotes);
    } catch (error) {
      console.error("Failed to load notes:", error);
    } finally {
      setIsLoadingNotes(false);
    }
  };

  // Handle adding a new note
  const handleNoteAdded = (newNote: CustomerNote) => {
    setNotes([newNote, ...notes]);
    onNoteAdded(newNote);
  };

  // Handle adding a new communication
  const handleCommunicationAdded = (newCommunication: CustomerCommunication) => {
    setCommunications([newCommunication, ...communications]);
    onCommunicationAdded(newCommunication);
  };

  // Calculate the number of vehicles for the badge
  const vehicleCount = customer.vehicles?.length || 0;

  return (
    <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="vehicles">
          Vehicles
          {vehicleCount > 0 && (
            <Badge className="ml-2 bg-amber-100 text-amber-800">{vehicleCount}</Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="notes">
          Notes
          {notes.length > 0 && (
            <Badge className="ml-2 bg-blue-100 text-blue-800">{notes.length}</Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="communications">
          Communications
          {communications.length > 0 && (
            <Badge className="ml-2 bg-green-100 text-green-800">{communications.length}</Badge>
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
          <EnhancedCustomerPreview 
            customer={customer}
            workOrderCount={customerWorkOrders.length}
            lastServiceDate={customer.lastServiceDate}
          />
        </div>
      </TabsContent>
      
      <TabsContent value="vehicles" className="mt-6">
        <CustomerVehiclesTab customer={customer} />
      </TabsContent>
      
      <TabsContent value="notes" className="mt-6">
        <CustomerNotesTimeline
          customer={customer}
          notes={notes}
          onNoteAdded={handleNoteAdded}
          isLoading={isLoadingNotes}
        />
      </TabsContent>
      
      <TabsContent value="communications" className="mt-6">
        <CommunicationHistory
          customer={customer}
          communications={communications}
          onCommunicationAdded={handleCommunicationAdded}
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
