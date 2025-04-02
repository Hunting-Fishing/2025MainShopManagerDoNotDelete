
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { createCustomer, clearDraftCustomer } from "@/services/customers";
import { CustomerFormValues } from "@/components/customers/form/CustomerFormSchema";
import { handleApiError } from "@/utils/errorHandling";
import { supabase } from "@/integrations/supabase/client";
import { recordWorkOrderActivity } from "@/utils/activity/workOrderActivity";
import { technicians } from "@/components/customers/form/CustomerFormSchema";

export const useCustomerCreate = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [newCustomerId, setNewCustomerId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const formRef = useRef<{ submit: () => void }>({ submit: () => {} });
  
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
  };

  const onSubmit = async (data: CustomerFormValues) => {
    setIsSubmitting(true);
    try {
      let householdId = data.household_id === "_none" ? "" : data.household_id;
      
      if (data.create_new_household && data.new_household_name) {
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
          householdId = newHousehold.id;
        }
      }
      
      const preferredTechnicianId = data.preferred_technician_id === "_none" ? "" : data.preferred_technician_id;
      const referralSource = data.referral_source === "_none" ? "" : data.referral_source;
      const communicationPreference = data.communication_preference === "_none" ? "" : data.communication_preference;
      
      const customerData = {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email || "",
        phone: data.phone || "",
        address: data.address || "",
        shop_id: data.shop_id,
        preferred_technician_id: preferredTechnicianId,
        communication_preference: communicationPreference,
        referral_source: referralSource,
        referral_person_id: data.referral_person_id,
        other_referral_details: referralSource === "Other" ? data.other_referral_details : "",
        notes: data.notes,
        household_id: householdId || null,
      };
      
      const newCustomer = await createCustomer(customerData);
      
      if (householdId && data.household_relationship) {
        const { error: relationshipError } = await supabase
          .from("household_members")
          .insert({
            household_id: householdId,
            customer_id: newCustomer.id,
            relationship_type: data.household_relationship
          });
        
        if (relationshipError) {
          console.error("Failed to add customer to household:", relationshipError);
        }
      }
      
      if (data.segments && data.segments.length > 0) {
        const segmentAssignments = data.segments.map(segmentId => ({
          customer_id: newCustomer.id,
          segment_id: segmentId,
          is_automatic: false
        }));
        
        const { error: segmentError } = await supabase
          .from("customer_segment_assignments")
          .insert(segmentAssignments);
        
        if (segmentError) {
          console.error("Failed to assign segments to customer:", segmentError);
        }
      }
      
      if (preferredTechnicianId) {
        try {
          const selectedTechnician = technicians.find(tech => tech.id === preferredTechnicianId);
          const technicianName = selectedTechnician ? selectedTechnician.name : "Unknown";
          
          await recordWorkOrderActivity(
            `Preferred technician set to ${technicianName} (${preferredTechnicianId}) during customer creation`,
            "00000000-0000-0000-0000-000000000000",
            "system", 
            "System"
          );
        } catch (historyError) {
          console.error("Error recording technician preference:", historyError);
        }
      }
      
      await clearDraftCustomer();
      
      setIsSuccess(true);
      setNewCustomerId(newCustomer.id);
      
      toast({
        title: "Customer Created Successfully",
        description: `${data.first_name} ${data.last_name} has been added to your customers.`,
        variant: "success",
      });
      
      setTimeout(() => {
        navigate(`/customers/${newCustomer.id}`);
      }, 2000);
    } catch (error) {
      handleApiError(error, "Failed to create customer");
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

  // Function to be called from the header button
  const handleSubmitForm = () => {
    if (formRef.current && typeof formRef.current.submit === 'function') {
      formRef.current.submit();
    } else {
      console.log("Form ref or submit method not available");
      // If the form ref isn't available, find the form and submit it
      const formElement = document.querySelector('form');
      if (formElement) {
        formElement.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
      }
    }
  };

  return {
    isSubmitting,
    isSuccess,
    newCustomerId,
    defaultValues,
    onSubmit,
    handleImportComplete,
    handleSubmitForm,
    formRef
  };
};
