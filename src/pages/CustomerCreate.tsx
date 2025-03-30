
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createCustomer } from "@/services/customerService";
import type { CustomerCreate as CustomerCreateType } from "@/services/customerService";
import { useToast } from "@/hooks/use-toast";
import { handleApiError } from "@/utils/errorHandling";
import { CustomerForm } from "@/components/customers/form/CustomerForm";
import { CustomerFormValues } from "@/components/customers/form/CustomerFormSchema";

export default function CustomerCreate() {
  const [isSubmitting, setIsSubmitting] = useState(false);
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
        // Additional fields would need to be added to the Customer type and database
      };
      
      // Create customer
      const newCustomer = await createCustomer(customerData);
      
      // Show success message
      toast({
        title: "Customer created",
        description: "The customer has been successfully created.",
        variant: "default",
      });
      
      // Navigate to the new customer's detail page
      navigate(`/customers/${newCustomer.id}`);
    } catch (error) {
      handleApiError(error, "Failed to create customer");
    } finally {
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

      <CustomerForm 
        defaultValues={defaultValues} 
        onSubmit={onSubmit} 
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
