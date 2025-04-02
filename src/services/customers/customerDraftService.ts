
import { CustomerFormValues } from "@/components/customers/form/CustomerFormSchema";

// Key for storing draft customer data in localStorage
const DRAFT_CUSTOMER_KEY = 'draftCustomer';

/**
 * Save customer form draft to localStorage
 * @param customerData The customer form data to save as draft
 */
export const saveDraftCustomer = async (customerData: CustomerFormValues): Promise<void> => {
  try {
    localStorage.setItem(DRAFT_CUSTOMER_KEY, JSON.stringify(customerData));
    return Promise.resolve();
  } catch (error) {
    console.error("Error saving draft customer:", error);
    return Promise.reject(error);
  }
};

/**
 * Retrieve customer form draft from localStorage
 */
export const getDraftCustomer = async (): Promise<CustomerFormValues | null> => {
  try {
    const draftData = localStorage.getItem(DRAFT_CUSTOMER_KEY);
    if (!draftData) return null;
    
    return JSON.parse(draftData) as CustomerFormValues;
  } catch (error) {
    console.error("Error retrieving draft customer:", error);
    return null;
  }
};

/**
 * Clear customer form draft from localStorage
 */
export const clearDraftCustomer = async (): Promise<void> => {
  try {
    localStorage.removeItem(DRAFT_CUSTOMER_KEY);
    return Promise.resolve();
  } catch (error) {
    console.error("Error clearing draft customer:", error);
    return Promise.reject(error);
  }
};
