
import { CustomerFormValues } from "@/components/customers/form/CustomerFormSchema";
import { technicians } from "@/components/customers/form/CustomerFormSchema";
import { createCustomer, addCustomerNote } from "@/services/customers";
import { supabase } from "@/integrations/supabase/client";
import { recordWorkOrderActivity } from "@/utils/activity/workOrderActivity";

/**
 * Process household logic during customer creation
 */
export const processHouseholdData = async (data: CustomerFormValues): Promise<string | null> => {
  if (data.household_id === "_none") {
    return "";
  }
  
  // Create new household if requested
  if (data.create_new_household && data.new_household_name) {
    try {
      const { data: newHousehold, error: householdError } = await supabase
        .from("households")
        .insert({
          name: data.new_household_name,
          address: data.address
        })
        .select("id")
        .single();
      
      if (householdError) {
        throw householdError;
      }
      
      if (newHousehold) {
        return newHousehold.id;
      }
    } catch (error) {
      console.error("Error creating household:", error);
      throw error;
    }
  }
  
  return data.household_id || null;
};

/**
 * Process segments assignment after customer creation
 */
export const processSegmentAssignments = async (customerId: string, segments: string[]): Promise<void> => {
  if (!segments || segments.length === 0) {
    return;
  }
  
  const segmentAssignments = segments.map(segmentId => ({
    customer_id: customerId,
    segment_id: segmentId,
    is_automatic: false
  }));
  
  const { error: segmentError } = await supabase
    .from("customer_segment_assignments")
    .insert(segmentAssignments);
  
  if (segmentError) {
    console.error("Failed to assign segments to customer:", segmentError);
    throw segmentError;
  }
};

/**
 * Process household member relationship assignment
 */
export const processHouseholdMembership = async (
  customerId: string, 
  householdId: string | null, 
  relationship: string
): Promise<void> => {
  if (!householdId || !relationship) {
    return;
  }
  
  const { error: relationshipError } = await supabase
    .from("household_members")
    .insert({
      household_id: householdId,
      customer_id: customerId,
      relationship_type: relationship
    });
  
  if (relationshipError) {
    console.error("Failed to add customer to household:", relationshipError);
    throw relationshipError;
  }
};

/**
 * Record technician preference activity
 */
export const recordTechnicianPreference = async (technicianId: string): Promise<void> => {
  if (!technicianId) {
    return;
  }
  
  try {
    const selectedTechnician = technicians.find(tech => tech.id === technicianId);
    const technicianName = selectedTechnician ? selectedTechnician.name : "Unknown";
    
    await recordWorkOrderActivity(
      `Preferred technician set to ${technicianName} (${technicianId}) during customer creation`,
      "00000000-0000-0000-0000-000000000000",
      "system", 
      "System"
    );
  } catch (historyError) {
    console.error("Error recording technician preference:", historyError);
  }
};

/**
 * Prepare customer data from form values
 */
export const prepareCustomerData = (formData: CustomerFormValues) => {
  const preferredTechnicianId = formData.preferred_technician_id === "_none" ? "" : formData.preferred_technician_id;
  const referralSource = formData.referral_source === "_none" ? "" : formData.referral_source;
  
  return {
    first_name: formData.first_name,
    last_name: formData.last_name,
    email: formData.email || "",
    phone: formData.phone || "",
    address: formData.address || "",
    city: formData.city || "",
    state: formData.state || "",
    postal_code: formData.postal_code || "",
    country: formData.country || "",
    shop_id: formData.shop_id,
    preferred_technician_id: preferredTechnicianId,
    referral_source: referralSource,
    referral_person_id: formData.referral_person_id,
    other_referral_details: referralSource === "Other" ? formData.other_referral_details : "",
    household_id: null, // Will be updated after processing households
    notes: formData.notes || "",
  };
};
