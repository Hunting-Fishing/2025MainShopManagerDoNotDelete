
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createCustomer } from "@/services/customerService";
import type { CustomerCreate as CustomerCreateType } from "@/services/customerService";
import { useToast } from "@/hooks/use-toast";
import { handleApiError } from "@/utils/errorHandling";
import { CustomerForm } from "@/components/customers/form/CustomerForm";
import { CustomerFormValues } from "@/components/customers/form/CustomerFormSchema";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Check } from "lucide-react";

export default function CustomerCreate() {
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
    tags: "",
    preferred_technician_id: "",
    referral_source: "",
    referral_person_id: "",
    is_fleet: false,
    fleet_company: "",
    vehicles: [],
  };

  // Form submission handler
  const onSubmit = async (data: CustomerFormValues) => {
    setIsSubmitting(true);
    try {
      // Prepare customer data - ensure all required fields are provided
      const customerData: CustomerCreateType = {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone: data.phone || "",
        address: data.address || "",
        shop_id: data.shop_id,
        // Add the new fields
        preferred_technician_id: data.preferred_technician_id,
        referral_source: data.referral_source,
        referral_person_id: data.referral_person_id,
        is_fleet: data.is_fleet,
        fleet_company: data.fleet_company,
        notes: data.notes,
      };
      
      // Create customer
      const newCustomer = await createCustomer(customerData);
      
      // Set success state
      setIsSuccess(true);
      setNewCustomerId(newCustomer.id);
      
      // Show success message
      toast({
        title: "Customer Created Successfully",
        description: `${data.first_name} ${data.last_name} has been added to your customers.`,
        variant: "success",
      });
      
      // Redirect after a short delay to allow the user to see the success message
      setTimeout(() => {
        navigate(`/customers/${newCustomer.id}`);
      }, 2000);
    } catch (error) {
      handleApiError(error, "Failed to create customer");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Add New Customer</h1>
        <p className="text-muted-foreground">
          Create a new customer record in the system
        </p>
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
        <CustomerForm 
          defaultValues={defaultValues} 
          onSubmit={onSubmit} 
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}
