
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

export default function CustomerDetails() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Early validation - redirect if no ID or "undefined" ID
  useEffect(() => {
    if (!id || id === "undefined") {
      console.error("Invalid customer ID in URL:", id);
      navigate("/customers", { replace: true });
    }
  }, [id, navigate]);
  
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
      // If we need to pass a parameter later, we can adjust this function
      handleCommunicationAdded({} as CustomerCommunication);
    }
  };

  const onNoteAddedWrapper = () => {
    if (handleNoteAdded) {
      // If we need to pass a parameter later, we can adjust this function
      handleNoteAdded({} as CustomerNote);
    }
  };

  if (!id || id === "undefined") {
    return (
      <div className="space-y-6">
        <Alert variant="destructive" className="animate-pulse">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Missing Customer ID</AlertTitle>
          <AlertDescription>
            No customer ID was provided. You'll be redirected to the customers list.
          </AlertDescription>
        </Alert>
        
        <div className="flex justify-center mt-6">
          <Button onClick={() => navigate('/customers')} variant="default">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go to Customers List
          </Button>
        </div>
      </div>
    );
  }

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
