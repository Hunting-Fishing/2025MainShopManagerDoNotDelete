
import { useCallback } from "react";
import { UseFormReturn } from "react-hook-form";
import { CustomerFormValues } from "./CustomerFormSchema";

export const useFormValidation = (form: UseFormReturn<CustomerFormValues>) => {
  const hasErrors = Object.keys(form.formState.errors).length > 0;

  const checkSectionErrors = useCallback((fields: string[]) => {
    return fields.some(field => !!form.formState.errors[field as keyof CustomerFormValues]);
  }, [form.formState.errors]);

  const hasPersonalErrors = checkSectionErrors([
    "first_name", "last_name", "email", "phone", "address"
  ]);
  
  const hasBusinessErrors = checkSectionErrors([
    "company", "shop_id", "notes", "tags"
  ]);
  
  const hasPreferencesErrors = checkSectionErrors([
    "preferred_technician_id"
  ]);
  
  const hasReferralFleetErrors = checkSectionErrors([
    "referral_source", "referral_person_id", "is_fleet", "fleet_company"
  ]);
  
  const hasVehicleErrors = !!form.formState.errors.vehicles;

  return {
    hasErrors,
    hasPersonalErrors,
    hasBusinessErrors,
    hasPreferencesErrors,
    hasReferralFleetErrors,
    hasVehicleErrors
  };
};
