
import { supabase } from "@/integrations/supabase/client";
import { Customer, CustomerCreate, adaptCustomerForUI } from "@/types/customer";
import { CustomerFormValues } from "@/components/customers/form/CustomerFormSchema";
import { getCustomerLoyalty } from "../loyalty/customerLoyaltyService";

// Export CustomerCreate type
export type { CustomerCreate };

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

// Create a new customer
export const createCustomer = async (customer: CustomerCreate): Promise<Customer> => {
  // Remove any undefined values to prevent Supabase errors
  Object.keys(customer).forEach(key => {
    if (customer[key as keyof CustomerCreate] === undefined) {
      delete customer[key as keyof CustomerCreate];
    }
  });

  // Remove fields that don't exist in the customers table
  const { 
    fleet_company, 
    is_fleet,
    tags,
    segments,
    communication_preference,
    other_referral_details,
    notes, // We'll handle notes separately
    city,
    state,
    postal_code,
    country,
    ...customerData 
  } = customer;

  // Update the address field to include the full address if components are provided
  let fullAddress = customer.address || '';
  if (city || state || postal_code || country) {
    // Only append components that exist
    if (fullAddress && city) fullAddress += ', ';
    if (city) fullAddress += city;
    if ((fullAddress && state) || (city && state)) fullAddress += ', ';
    if (state) fullAddress += state;
    if ((fullAddress && postal_code) || (state && postal_code)) fullAddress += ' ';
    if (postal_code) fullAddress += postal_code;
    if ((fullAddress && country) || (postal_code && country) || (state && country)) fullAddress += ', ';
    if (country) fullAddress += country;

    // Update the address in customerData
    customerData.address = fullAddress;
  }

  // Handle households
  if (customerData.household_id === '' || customerData.household_id === '_none') {
    customerData.household_id = undefined;
  }

  // Handle preferred technician
  if (customerData.preferred_technician_id === '' || customerData.preferred_technician_id === '_none') {
    customerData.preferred_technician_id = undefined;
  }

  // Handle referral source
  if (customerData.referral_source === '' || customerData.referral_source === '_none') {
    customerData.referral_source = undefined;
  }

  // Remove referral_person_id if it's empty
  if (customerData.referral_person_id === '') {
    delete customerData.referral_person_id;
  }

  console.log("Submitting customer data:", customerData);

  const { data, error } = await supabase
    .from("customers")
    .insert(customerData)
    .select()
    .single();

  if (error) {
    console.error("Error creating customer:", error);
    throw error;
  }

  // If there's a note, add it to the customer_notes table
  if (notes && notes.trim()) {
    try {
      await addCustomerNote(data.id, notes, 'general', 'System');
    } catch (noteError) {
      console.error("Error adding initial customer note:", noteError);
      // We don't throw here to avoid preventing customer creation
    }
  }

  return adaptCustomerForUI(data);
};

// Add customer note
export const addCustomerNote = async (
  customerId: string, 
  content: string, 
  category: string = 'general',
  createdBy: string = 'Current User'
): Promise<any> => {
  const { data, error } = await supabase
    .from("customer_notes")
    .insert({
      customer_id: customerId,
      content,
      category,
      created_by: createdBy
    })
    .select()
    .single();

  if (error) {
    console.error("Error adding customer note:", error);
    throw error;
  }

  return data;
};

// Get customer notes
export const getCustomerNotes = async (customerId: string): Promise<any[]> => {
  const { data, error } = await supabase
    .from("customer_notes")
    .select("*")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching customer notes:", error);
    throw error;
  }

  return data || [];
};

// Update a customer
export const updateCustomer = async (id: string, updates: Partial<Customer>): Promise<Customer> => {
  const { data, error } = await supabase
    .from("customers")
    .update(updates)
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
