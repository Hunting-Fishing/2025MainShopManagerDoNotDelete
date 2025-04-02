
import { supabase } from "@/integrations/supabase/client";
import { Customer, CustomerCreate, adaptCustomerForUI } from "@/types/customer";
import { getCustomerLoyalty } from "./loyalty/customerLoyaltyService";
import { CustomerFormValues } from "@/components/customers/form/CustomerFormSchema";
import { importCustomersFromCSV } from "./customers/customerImportService";

// Export CustomerCreate type
export type { CustomerCreate };

// Re-export importCustomersFromCSV
export { importCustomersFromCSV };

// Fetch all customers
export const getAllCustomers = async (): Promise<Customer[]> => {
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .order("last_name", { ascending: true });

  if (error) {
    console.error("Error fetching customers:", error);
    throw error;
  }

  // Adapt each customer for UI components
  const customers = (data || []).map(customer => adaptCustomerForUI(customer));
  
  // Fetch loyalty data for each customer
  // This is done separately to keep the initial customer query simple
  try {
    for (const customer of customers) {
      try {
        const loyalty = await getCustomerLoyalty(customer.id);
        if (loyalty) {
          customer.loyalty = loyalty;
        }
      } catch (error) {
        console.error(`Error fetching loyalty for customer ${customer.id}:`, error);
      }
    }
  } catch (error) {
    console.error("Error fetching customer loyalty data:", error);
  }

  return customers;
};

// Fetch a customer by ID
export const getCustomerById = async (id: string): Promise<Customer | null> => {
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching customer:", error);
    throw error;
  }

  if (!data) return null;
  
  const customer = adaptCustomerForUI(data);
  
  // Fetch loyalty data
  try {
    const loyalty = await getCustomerLoyalty(customer.id);
    if (loyalty) {
      customer.loyalty = loyalty;
    }
  } catch (error) {
    console.error(`Error fetching loyalty for customer ${customer.id}:`, error);
  }

  return customer;
};

// Update a customer
export const updateCustomer = async (id: string, updates: CustomerFormValues): Promise<Customer> => {
  // Format the data for the database
  const customerData = {
    first_name: updates.first_name,
    last_name: updates.last_name,
    email: updates.email,
    phone: updates.phone,
    address: updates.address,
    city: updates.city,
    state: updates.state,
    postal_code: updates.postal_code, 
    country: updates.country,
    company: updates.company,
    notes: updates.notes,
    shop_id: updates.shop_id,
    tags: updates.tags,
    communication_preference: updates.communication_preference,
    referral_source: updates.referral_source,
    referral_person_id: updates.referral_person_id,
    other_referral_details: updates.other_referral_details,
    is_fleet: updates.is_fleet,
    fleet_company: updates.fleet_company,
    household_id: updates.household_id
  };

  const { data, error } = await supabase
    .from("customers")
    .update(customerData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating customer:", error);
    throw error;
  }

  return adaptCustomerForUI(data);
};

// Delete a customer
export const deleteCustomer = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from("customers")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting customer:", error);
    throw error;
  }
};
