
import React from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { CustomerForm } from "@/components/customers/form/CustomerForm";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCustomerEdit } from "@/hooks/useCustomerEdit";
import { DeleteCustomerButton } from "@/components/customers/form/DeleteCustomerButton";
import { Customer } from "@/types/customer";
import { CustomerFormValues } from "@/components/customers/form/CustomerFormSchema";
import { formatVehicleYear } from "@/types/customer/vehicle";

// Transform Customer to CustomerFormValues
const transformCustomerToFormValues = (customer: Customer): CustomerFormValues => {
  const transformedVehicles = customer.vehicles?.map(vehicle => ({
    ...vehicle,
    year: formatVehicleYear(vehicle.year), // Ensure year is always a string
    // Handle any other field transformations needed for the form
    vin: vehicle.vin || '',
    license_plate: vehicle.license_plate || '',
    trim: vehicle.trim || '',
    transmission: vehicle.transmission || '',
    drive_type: vehicle.drive_type || '',
    fuel_type: vehicle.fuel_type || '',
    engine: vehicle.engine || '',
    body_style: vehicle.body_style || '',
    country: vehicle.country || '',
    transmission_type: vehicle.transmission_type || '',
    gvwr: vehicle.gvwr || '',
    color: vehicle.color || ''
  })) || [];

  return {
    ...customer,
    vehicles: transformedVehicles,
    // Ensure other form-specific transformations
    segments: Array.isArray(customer.segments) ? customer.segments : [],
    tags: Array.isArray(customer.tags) ? customer.tags : []
  } as CustomerFormValues;
};

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
    // Navigate back to customer details page
    if (id && id !== "undefined") {
      navigate(`/customers/${id}`);
    } else {
      navigate('/customers');
    }
  };

  const handleHeaderSubmit = () => {
    // Trigger form submission via form ID
    const form = document.getElementById('customer-edit-form') as HTMLFormElement;
    if (form) {
      form.requestSubmit();
    }
  };

  // Early validation - redirect if no ID or "undefined" ID
  React.useEffect(() => {
    if (!id || id === "undefined") {
      console.error("Invalid customer ID in URL:", id);
      navigate("/customers", { replace: true });
      toast({
        title: "Invalid Customer ID",
        description: "No customer ID was provided. Redirecting to customers list.",
        variant: "destructive"
      });
    }
  }, [id, navigate, toast]);

  if (!id || id === "undefined") {
    return null; // Will redirect via useEffect
  }

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
  
  // Transform the customer data to match form expectations
  const transformedFormValues = transformCustomerToFormValues(formValues);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button variant="ghost" onClick={handleBack}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Customer Details
        </Button>
        <div className="flex gap-2">
          <Button 
            onClick={handleHeaderSubmit}
            disabled={isSubmitting}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSubmitting ? (
              <>
                <Save className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Update Customer Information
              </>
            )}
          </Button>
          {id && <DeleteCustomerButton customerId={id} customerName={customerName} />}
        </div>
      </div>
      <h1 className="text-2xl font-bold tracking-tight">Edit Customer</h1>
      <CustomerForm 
        defaultValues={transformedFormValues}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        availableShops={availableShops}
        singleShopMode={availableShops.length === 1}
        isEditMode={true}
        customerId={id}
        initialTab={activeTab || undefined}
        formId="customer-edit-form"
      />
    </div>
  );
}
