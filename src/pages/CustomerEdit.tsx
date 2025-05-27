
import React from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { CustomerForm } from "@/components/customers/form/CustomerForm";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCustomerEdit } from "@/hooks/useCustomerEdit";
import { DeleteCustomerButton } from "@/components/customers/form/DeleteCustomerButton";

export default function CustomerEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab');
  const { toast } = useToast();
  const { 
    formValues, 
    isLoading, 
    isSubmitting, 
    availableShops, 
    handleSubmit,
    error 
  } = useCustomerEdit(id);

  const handleBack = () => {
    navigate(`/customers/${id}`);
  };

  if (error) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={handleBack}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Customer Details
        </Button>
        <div className="rounded-md border border-destructive p-4 mt-4">
          <h2 className="text-lg font-medium text-destructive">Error Loading Customer</h2>
          <p className="text-sm text-muted-foreground mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={handleBack}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Customer Details
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Edit Customer</h1>
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-32 w-full" />
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button variant="ghost" onClick={handleBack}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Customer Details
        </Button>
        {id && <DeleteCustomerButton customerId={id} customerName={customerName} />}
      </div>
      <h1 className="text-2xl font-bold tracking-tight">Edit Customer</h1>
      <CustomerForm 
        defaultValues={formValues}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        availableShops={availableShops}
        singleShopMode={availableShops.length === 1}
        isEditMode={true}
        customerId={id}
        initialTab={activeTab || undefined}
      />
    </div>
  );
}
