
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
    // Set the role to "Customer" by default for new customer entries
    role: "Customer",
  });

  // Update defaultValues when currentUserShopId changes
  if (currentUserShopId && defaultValues.shop_id !== currentUserShopId) {
    setDefaultValues(prev => ({
      ...prev,
      shop_id: currentUserShopId
    }));
  }

  const onSubmit = async (data: CustomerFormValues) => {
    // Always ensure customers get the Customer role
    const customerData = { ...data, role: "Customer" };
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
