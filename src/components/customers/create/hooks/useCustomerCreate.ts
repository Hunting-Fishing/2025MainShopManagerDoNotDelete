
import { useState } from "react";
import { CustomerFormValues } from "@/components/customers/form/schemas/customerSchema";
import { useShopData } from "./useShopData";
import { useCustomerSubmit } from "./useCustomerSubmit";
import { showImportCompleteNotification } from "../utils/customerNotificationHandler";
import { useToast } from "@/hooks/use-toast";

export const useCustomerCreate = () => {
  const { isLoading, availableShops, currentUserShopId } = useShopData();
  const { isSubmitting, isSuccess, newCustomerId, handleSubmit } = useCustomerSubmit();
  const { toast } = useToast();
  
  const [defaultValues, setDefaultValues] = useState<CustomerFormValues>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    postal_code: "",
    country: "",
    company: "",
    notes: "",
    shop_id: currentUserShopId || "",
    tags: [],
    preferred_technician_id: "",
    communication_preference: "",
    referral_source: "",
    referral_person_id: "",
    other_referral_details: "",
    is_fleet: false,
    fleet_company: "",
    vehicles: [],
    segments: [],
    create_new_household: false,
    new_household_name: "",
    household_id: "", 
    household_relationship: "primary",
    // Remove role from default values since it's not part of the customers table
  });

  // Update defaultValues when currentUserShopId changes
  if (currentUserShopId && defaultValues.shop_id !== currentUserShopId) {
    setDefaultValues(prev => ({
      ...prev,
      shop_id: currentUserShopId
    }));
  }

  const onSubmit = async (data: CustomerFormValues) => {
    // Remove role from the data before submitting since it's not part of the customers table
    const { role, ...customerData } = data;
    
    console.log("Submitting customer with vehicles:", customerData.vehicles);
    
    await handleSubmit(customerData, currentUserShopId);
  };

  const handleImportComplete = () => {
    showImportCompleteNotification(toast);
  };

  return {
    isSubmitting,
    isSuccess,
    isLoading,
    newCustomerId,
    defaultValues,
    availableShops,
    onSubmit,
    handleImportComplete,
  };
};
