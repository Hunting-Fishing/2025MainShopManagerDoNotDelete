
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CustomerFormValues } from '@/components/customers/form/schemas/customerSchema';
import { useToast } from '@/hooks/use-toast';
import { createCustomer, clearDraftCustomer } from '@/services/customer/customerCreateService';

export const useCustomerSubmit = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (formData: CustomerFormValues) => {
    setIsSubmitting(true);
    setError(null);

    try {
      console.log("Creating customer with data:", formData);
      
      // Create the customer with the form data
      const result = await createCustomer(formData);
      
      // Clear draft data after successful creation
      await clearDraftCustomer();
      
      toast({
        title: "Success!",
        description: `${formData.first_name} ${formData.last_name} was created successfully.`,
      });
      
      navigate(`/customers/${result.id}`);
      return result;
    } catch (err: any) {
      console.error("Error creating customer:", err);
      setError(err.message || "Failed to create customer. Please try again.");
      
      toast({
        title: "Error",
        description: err.message || "Failed to create customer. Please try again.",
        variant: "destructive",
      });
      
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    handleSubmit,
    isSubmitting,
    error,
  };
};
