
import React, { useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { CustomerForm } from "@/components/customers/form/CustomerForm";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCustomerEdit } from "@/hooks/useCustomerEdit";
import { DeleteCustomerButton } from "@/components/customers/form/DeleteCustomerButton";
import { UnsavedChangesAlert } from "@/components/common/UnsavedChangesAlert";
import { EnhancedLoadingState } from "@/components/common/EnhancedLoadingState";
import { useAccessibility } from "@/hooks/useAccessibility";

export default function EditCustomer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab');
  const { toast } = useToast();
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Use our enhanced customer edit hook with all the new features
  const { 
    formValues, 
    isLoading, 
    isSubmitting, 
    isDirty,
    availableShops, 
    handleSubmit,
    error,
    setIsDirty
  } = useCustomerEdit(id);

  // Apply accessibility features
  useAccessibility(containerRef, {
    ariaLive: true,
    escapeToClose: true,
    onEscape: () => {
      if (isDirty) {
        // Show confirmation dialog
        const confirmed = window.confirm("You have unsaved changes. Are you sure you want to leave?");
        if (confirmed) {
          navigate(`/customers/${id}`);
        }
      } else {
        navigate(`/customers/${id}`);
      }
    }
  });

  // Handle back button click
  const handleBack = () => {
    if (isDirty) {
      const confirmed = window.confirm("You have unsaved changes. Are you sure you want to leave?");
      if (!confirmed) return;
    }
    navigate(`/customers/${id}`);
  };

  // Show error if customer not found or error loading
  if (error) {
    return (
      <div className="space-y-4" ref={containerRef}>
        <Button variant="ghost" onClick={handleBack}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Customer Details
        </Button>
        <div className="rounded-md border border-destructive p-4 mt-4">
          <h2 className="text-lg font-medium text-destructive">Error Loading Customer</h2>
          <p className="text-sm text-muted-foreground mt-1">{error}</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Loading state with enhanced skeleton
  if (isLoading) {
    return (
      <div className="space-y-6" ref={containerRef}>
        <Button variant="ghost" disabled>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Customer Details
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Edit Customer</h1>
        <EnhancedLoadingState type="form" count={1} />
      </div>
    );
  }

  if (!formValues) {
    navigate(`/customers/${id}`);
    toast({
      title: "Customer not found",
      description: "Could not find the customer you're trying to edit.",
      variant: "destructive"
    });
    return null;
  }

  const customerName = `${formValues.first_name} ${formValues.last_name}`;

  return (
    <div className="space-y-6" ref={containerRef}>
      {/* Unsaved changes protection */}
      <UnsavedChangesAlert isDirty={isDirty} />
      
      <div className="flex justify-between items-center">
        <Button variant="ghost" onClick={handleBack}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Customer Details
        </Button>
        {id && <DeleteCustomerButton customerId={id} customerName={customerName} />}
      </div>
      
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">
          Edit Customer: {customerName}
        </h1>
      </div>
      
      {/* Accessible form */}
      <div 
        role="region" 
        aria-label="Customer edit form"
        className="pb-20"
      >
        <CustomerForm 
          defaultValues={formValues}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          availableShops={availableShops}
          singleShopMode={availableShops.length === 1}
          isEditMode={true}
          customerId={id}
          initialTab={activeTab || undefined}
          onDirtyStateChange={setIsDirty}
        />
      </div>
    </div>
  );
}
