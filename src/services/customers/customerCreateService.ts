import { supabase } from "@/integrations/supabase/client";
import { Customer, CustomerCreate, adaptCustomerForUI } from "@/types/customer";
import { addCustomerNote } from "./index";

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

  // Ensure shop_id is set
  if (!customerData.shop_id) {
    // Fetch the shop_id from the current user's profile
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('shop_id')
        .eq('id', user.id)
        .single();
      
      if (profile && profile.shop_id) {
        customerData.shop_id = profile.shop_id;
      }
    }
    
    // If still not set, use the default UUID as fallback
    if (!customerData.shop_id) {
      customerData.shop_id = '00000000-0000-0000-0000-000000000000';
    }
  }
  
  // Convert "DEFAULT-SHOP-ID" to a valid UUID if it's still using the default
  if (customerData.shop_id === 'DEFAULT-SHOP-ID') {
    customerData.shop_id = '00000000-0000-0000-0000-000000000000';
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
