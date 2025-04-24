
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
import { CustomerRedirect } from "@/components/routing/CustomerRedirect"; 

export default function CustomerDetails() {
  // Change from 'id' to 'customerId' to match the route parameter name used in routes.tsx
  const { customerId } = useParams<{ customerId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Validate the ID format earlier - UUID format validation
  const isValidUUID = customerId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(customerId);
  
  // Early validation - use CustomerRedirect component for invalid IDs
  if (!isValidUUID) {
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
  } = useCustomerDetails(customerId);
  
  // Check if the URL has a tab parameter to set the active tab
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [searchParams, setActiveTab]);
  
  // Refresh customer data when arriving at this page
  useEffect(() => {
    if (customerId && customerId !== "undefined") {
      refreshCustomerData();
    }
  }, [customerId, refreshCustomerData]);

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
      <div className="flex flex-col items-center justify-center h-60 space-y-4">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <div className="text-lg text-slate-600 font-medium">Loading customer details...</div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="space-y-6 p-4">
        <Alert variant="destructive" className="border-red-500 bg-red-50">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle className="text-lg font-medium">Customer Not Found</AlertTitle>
          <AlertDescription className="mt-2">
            <p>{error || "The requested customer could not be found. The customer may have been deleted or you don't have permission to view it."}</p>
          </AlertDescription>
        </Alert>
        
        <div className="flex justify-center mt-8">
          <Button 
            onClick={() => navigate('/customers')} 
            variant="default"
            className="bg-blue-600 hover:bg-blue-700"
          >
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
