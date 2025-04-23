
import React, { useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useCustomerDetails } from "@/hooks/useCustomerDetails";
import { AddInteractionDialog } from "@/components/interactions/AddInteractionDialog";
import { CustomerDetailsHeader } from "@/components/customers/details/CustomerDetailsHeader";
import { CustomerDetailsTabs } from "@/components/customers/details/CustomerDetailsTabs";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CustomerCommunication, CustomerNote } from "@/types/customer";
import { CustomerRedirect } from "@/components/routing/CustomerRedirect"; // Import for handling ID validation

export default function CustomerDetails() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Early validation - use CustomerRedirect component for invalid IDs
  if (!id || id === "undefined") {
    return <CustomerRedirect />;
  }
  
  const {
    customer,
    customerWorkOrders,
    customerInteractions,
    customerCommunications,
    customerNotes,
    loading,
    error,
    addInteractionOpen,
    setAddInteractionOpen,
    activeTab,
    setActiveTab,
    refreshCustomerData,
    handleInteractionAdded,
    handleCommunicationAdded,
    handleNoteAdded
  } = useCustomerDetails(id);
  
  // Check if the URL has a tab parameter to set the active tab
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [searchParams, setActiveTab]);
  
  // Refresh customer data when arriving at this page
  useEffect(() => {
    if (id && id !== "undefined") {
      refreshCustomerData();
    }
  }, [id, refreshCustomerData]);

  // Create wrapper functions for onCommunicationAdded and onNoteAdded
  const onCommunicationAddedWrapper = () => {
    if (handleCommunicationAdded) {
      handleCommunicationAdded({} as CustomerCommunication);
    }
  };

  const onNoteAddedWrapper = () => {
    if (handleNoteAdded) {
      handleNoteAdded({} as CustomerNote);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="text-lg text-slate-500">Loading customer details...</div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error Loading Customer</AlertTitle>
          <AlertDescription>
            {error || "Customer not found. The customer may have been deleted or you don't have permission to view it."}
          </AlertDescription>
        </Alert>
        
        <div className="flex justify-center mt-6">
          <Button onClick={() => navigate('/customers')} variant="default">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Return to Customers List
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CustomerDetailsHeader 
        customer={customer}
        setAddInteractionOpen={setAddInteractionOpen}
      />

      <CustomerDetailsTabs
        customer={customer}
        customerWorkOrders={customerWorkOrders}
        customerInteractions={customerInteractions}
        customerCommunications={customerCommunications}
        customerNotes={customerNotes}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        setAddInteractionOpen={setAddInteractionOpen}
        onCommunicationAdded={onCommunicationAddedWrapper}
        onNoteAdded={onNoteAddedWrapper}
      />
      
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
