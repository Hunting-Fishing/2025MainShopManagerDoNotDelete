
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCustomer, clearDraftCustomer } from "@/services/customerService";
import { CustomerFormValues } from "@/components/customers/form/CustomerFormSchema";
import { useToast } from "@/hooks/use-toast";
import { handleApiError } from "@/utils/errorHandling";
import { CustomerForm } from "@/components/customers/form/CustomerForm";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Check } from "lucide-react";
import { WorkOrderFormHeader } from "@/components/work-orders/WorkOrderFormHeader";
import { ImportCustomersDialog } from "@/components/customers/form/import/ImportCustomersDialog";
import { Card } from "@/components/ui/card";

export default function CreateCustomer() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [newCustomerId, setNewCustomerId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Define default form values
  const defaultValues: CustomerFormValues = {
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    address: "",
    company: "",
    notes: "",
    shop_id: "DEFAULT-SHOP-ID",
    tags: [],
    preferred_technician_id: "",
    referral_source: "",
    referral_person_id: "",
    is_fleet: false,
    fleet_company: "",
    vehicles: [],
    segments: [],
    create_new_household: false,
    new_household_name: "",
    household_id: "",
    household_relationship: "primary",
  };

  // Form submission handler
  const onSubmit = async (data: CustomerFormValues) => {
    setIsSubmitting(true);
    try {
      // Create customer with all the data
      const customerData = {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email || "",
        phone: data.phone || "",
        address: data.address || "",
        shop_id: data.shop_id,
        preferred_technician_id: data.preferred_technician_id === "_none" ? "" : data.preferred_technician_id,
        referral_source: data.referral_source === "_none" ? "" : data.referral_source,
        referral_person_id: data.referral_person_id,
        is_fleet: data.is_fleet,
        fleet_company: data.fleet_company,
        notes: data.notes,
        tags: data.tags,
        household_id: data.household_id === "_none" ? null : data.household_id,
        segments: data.segments
      };
      
      const newCustomer = await createCustomer(customerData);
      
      // Clear any draft data
      await clearDraftCustomer();
      
      // Set success state
      setIsSuccess(true);
      setNewCustomerId(newCustomer.id);
      
      // Show success message
      toast({
        title: "Customer Created Successfully",
        description: `${data.first_name} ${data.last_name} has been added to your customers.`,
        variant: "success",
      });
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate(`/customers/${newCustomer.id}`);
      }, 2000);
    } catch (error) {
      console.error("Error creating customer:", error);
      toast({
        title: "Error",
        description: "There was a problem creating the customer. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImportComplete = () => {
    toast({
      title: "Import Complete",
      description: "Navigate to the Customers page to see imported customers.",
      variant: "success",
    });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4 sm:px-6">
      <div className="flex justify-between items-center">
        <WorkOrderFormHeader
          title="Add New Customer"
          description="Create a new customer record in the system"
        />
        <ImportCustomersDialog onImportComplete={handleImportComplete} />
      </div>

      {isSuccess && newCustomerId ? (
        <Alert variant="success" className="bg-green-50 border-green-200">
          <Check className="h-5 w-5 text-green-600" />
          <AlertTitle className="text-green-800 text-lg">Customer Created Successfully</AlertTitle>
          <AlertDescription className="text-green-700">
            The new customer has been added to the system. You will be redirected to the customer details page shortly.
          </AlertDescription>
        </Alert>
      ) : (
        <Card className="p-6">
          <CustomerForm 
            defaultValues={defaultValues} 
            onSubmit={onSubmit} 
            isSubmitting={isSubmitting}
          />
        </Card>
      )}
    </div>
  );
};
