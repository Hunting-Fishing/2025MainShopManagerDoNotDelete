import { useEffect, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { CustomerFormValues } from "./schemas/customerSchema";

export const useFormValidation = (form: UseFormReturn<CustomerFormValues>) => {
  const [hasPersonalErrors, setHasPersonalErrors] = useState(false);
  const [hasBusinessErrors, setHasBusinessErrors] = useState(false);
  const [hasPreferencesErrors, setHasPreferencesErrors] = useState(false);
  const [hasReferralErrors, setHasReferralErrors] = useState(false);
  const [hasVehicleErrors, setHasVehicleErrors] = useState(false);
  const [hasHouseholdErrors, setHasHouseholdErrors] = useState(false);
  const [hasSegmentErrors, setHasSegmentErrors] = useState(false);
  const [hasErrors, setHasErrors] = useState(false);

  const { errors } = form.formState;

  useEffect(() => {
    // Personal errors
    const personalFields = ['first_name', 'last_name', 'email', 'phone', 'address', 'shop_id'];
    setHasPersonalErrors(personalFields.some(field => !!errors[field as keyof typeof errors]));

    // Business errors (now includes fleet fields)
    const businessFields = ['company', 'tags', 'notes', 'is_fleet', 'fleet_company'];
    setHasBusinessErrors(businessFields.some(field => !!errors[field as keyof typeof errors]));

    // Preferences errors
    const preferencesFields = ['preferred_technician_id'];
    setHasPreferencesErrors(preferencesFields.some(field => !!errors[field as keyof typeof errors]));

    // Referral errors (no longer includes fleet fields)
    const referralFields = ['referral_source', 'referral_person_id'];
    setHasReferralErrors(referralFields.some(field => !!errors[field as keyof typeof errors]));

    // Vehicle errors
    setHasVehicleErrors(!!errors.vehicles);

    // Household errors
    const householdFields = ['household_id', 'create_new_household', 'new_household_name', 'household_relationship'];
    setHasHouseholdErrors(householdFields.some(field => !!errors[field as keyof typeof errors]));

    // Segment errors
    setHasSegmentErrors(!!errors.segments);

    // Overall validation
    setHasErrors(Object.keys(errors).length > 0);
  }, [errors]);

  return {
    hasErrors,
    hasPersonalErrors,
    hasBusinessErrors,
    hasPreferencesErrors,
    hasReferralErrors,
    hasVehicleErrors,
    hasHouseholdErrors,
    hasSegmentErrors
  };
};
