import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { CustomerFormValues } from '@/components/customers/form/schemas/customerSchema';
import { createCustomer } from '@/services/customer/customerCreateService';
import { convertFormVehicleToCustomerVehicle } from '@/types/customer/vehicle';
import { Customer } from '@/types/customer';

interface ProcessedCustomerData {
  customerData: Omit<CustomerFormValues, 'vehicles'>;
  vehiclesToCreate: any[];
}

export function useCustomerSubmit() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [newCustomerId, setNewCustomerId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const resetState = () => {
    setIsSubmitting(false);
    setIsSuccess(false);
    setNewCustomerId(null);
    setError(null);
  };

  const onSubmit = async (data: CustomerFormValues): Promise<void> => {
    setIsSubmitting(true);
    setIsSuccess(false);
    setNewCustomerId(null);
    setError(null);

    try {
      const { customerData, vehiclesToCreate } = await processCustomerData(data);

      const newCustomer: Customer | null = await createCustomer(customerData, vehiclesToCreate);

      if (newCustomer) {
        setNewCustomerId(newCustomer.id);
        setIsSuccess(true);
        toast({
          title: "Customer Created",
          description: "Customer has been successfully created.",
        });
        navigate(`/customers/${newCustomer.id}`);
      } else {
        setError("Failed to create customer");
        toast({
          title: "Error",
          description: "Failed to create customer. Please try again.",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      setError(err.message || "Failed to create customer");
      console.error("Create customer failed:", err);
      toast({
        title: "Error",
        description: "Failed to create customer. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const processCustomerData = async (data: CustomerFormValues): Promise<ProcessedCustomerData> => {
    console.log("Processing customer data:", data);

    // Validation and transformation logic here
    if (!data) {
      throw new Error("No data provided");
    }

    // Extract form-specific fields that shouldn't be saved to the database
    const {
      vehicles,
      create_new_household,
      new_household_name,
      household_relationship,
      household_size,
      household_income_range,
      preferred_technician_id = "", // Provide default value
      communication_preference,
      referral_person_id,
      other_referral_details,
      household_id,
      ...customerData
    } = data;

    // Process vehicles
    const vehiclesToCreate = vehicles ? vehicles.map(convertFormVehicleToCustomerVehicle) : [];

    // Handle technician preference if provided
    if (preferred_technician_id && preferred_technician_id.trim() !== "") {
      customerData.preferred_technician_id = preferred_technician_id;
    }

    return {
      customerData: customerData,
      vehiclesToCreate: vehiclesToCreate,
    };
  };

  return {
    isSubmitting,
    isSuccess,
    newCustomerId,
    error,
    onSubmit,
    resetState,
  };
}
