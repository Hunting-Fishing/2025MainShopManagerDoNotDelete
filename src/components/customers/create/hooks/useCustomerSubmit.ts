
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { CustomerFormValues } from "@/components/customers/form/CustomerFormSchema";
import { createCustomer, clearDraftCustomer, addCustomerNote } from "@/services/customers";
import { handleApiError } from "@/utils/errorHandling";
import { 
  processHouseholdData, 
  processSegmentAssignments, 
  processHouseholdMembership,
  recordTechnicianPreference,
  prepareCustomerData
} from "../utils/customerFormProcessor";
import {
  showSuccessNotification,
  showWarningNotification
} from "../utils/customerNotificationHandler";

export const useCustomerSubmit = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [newCustomerId, setNewCustomerId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (data: CustomerFormValues, currentUserShopId: string | null) => {
    console.log("handleSubmit called with data:", data);
    setIsSubmitting(true);
    
    try {
      // Ensure the shop_id is set to the current user's shop
      if (currentUserShopId && (!data.shop_id || data.shop_id === "")) {
        data.shop_id = currentUserShopId;
      }
      
      // Process household logic
      const householdId = await processHouseholdData(data);
      
      // Prepare customer data for creation
      const customerData = prepareCustomerData(data);
      customerData.household_id = householdId;
      
      // Create the customer
      const newCustomer = await createCustomer(customerData);
      
      // Handle post-creation tasks, treating each one independently to avoid cascading failures
      try {
        // Save customer notes if they exist
        if (data.notes && data.notes.trim()) {
          await addCustomerNote(
            newCustomer.id,
            data.notes,
            'general',
            'System'
          );
        }
      } catch (noteError) {
        console.error("Failed to save customer note:", noteError);
        showWarningNotification(toast, "note");
      }
      
      try {
        // Add customer to household if relevant
        if (householdId && data.household_relationship) {
          await processHouseholdMembership(
            newCustomer.id, 
            householdId, 
            data.household_relationship
          );
        }
      } catch (householdError) {
        console.error("Failed to add customer to household:", householdError);
        showWarningNotification(toast, "household");
      }
      
      try {
        // Assign customer segments if any were selected
        if (data.segments && data.segments.length > 0) {
          await processSegmentAssignments(newCustomer.id, data.segments);
        }
      } catch (segmentError) {
        console.error("Failed to assign segments to customer:", segmentError);
        showWarningNotification(toast, "segment");
      }
      
      try {
        // Record technician preference if selected
        if (data.preferred_technician_id && data.preferred_technician_id !== "_none") {
          await recordTechnicianPreference(data.preferred_technician_id);
        }
      } catch (techError) {
        console.error("Error recording technician preference:", techError);
        // Non-critical, no need for user notification
      }
      
      // Clear any draft data
      await clearDraftCustomer();
      
      // Update state
      setIsSuccess(true);
      setNewCustomerId(newCustomer.id);
      
      // Show success notification
      showSuccessNotification(toast, data.first_name, data.last_name);
      
      // Navigate to customer details page after a short delay
      setTimeout(() => {
        navigate(`/customers/${newCustomer.id}`);
      }, 2000);
    } catch (error) {
      handleApiError(error, "Failed to create customer");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    isSuccess,
    newCustomerId,
    handleSubmit
  };
};
