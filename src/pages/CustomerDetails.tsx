
import React, { useEffect, useMemo } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useCustomerDetails } from "@/hooks/useCustomerDetails";
import { AddInteractionDialog } from "@/components/interactions/AddInteractionDialog";
import { CustomerDetailsHeader } from "@/components/customers/details/CustomerDetailsHeader";
import { CustomerDetailsTabs } from "@/components/customers/details/CustomerDetailsTabs";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, ArrowLeft, Loader2 } from "lucide-react";
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
    customerLoyalty,
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

  // Create optimized wrapper functions that don't cause re-renders
  const onCommunicationAddedWrapper = useMemo(() => () => {
    if (handleCommunicationAdded) {
      handleCommunicationAdded({} as CustomerCommunication);
    }
    refreshCustomerData();
  }, [handleCommunicationAdded, refreshCustomerData]);

  const onNoteAddedWrapper = useMemo(() => () => {
    if (handleNoteAdded) {
      handleNoteAdded({} as CustomerNote);
    }
    refreshCustomerData();
  }, [handleNoteAdded, refreshCustomerData]);

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
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin" />
        <div className="text-lg text-slate-500">Loading customer details...</div>
        <div className="text-sm text-slate-400">
          Fetching customer data, vehicles, work orders, and communications...
        </div>
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
        customerLoyalty={customerLoyalty}
        loyaltyLoading={false}
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
