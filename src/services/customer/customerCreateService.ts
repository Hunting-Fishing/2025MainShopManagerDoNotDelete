import { supabase } from "@/integrations/supabase/client";
import { Customer, CustomerCreate, adaptCustomerForUI } from "@/types/customer";
import { addCustomerNote } from "./customerNotesService";

// Create a new customer
export const createCustomer = async (customer: CustomerCreate): Promise<Customer> => {
  // Remove any undefined values to prevent Supabase errors
  Object.keys(customer).forEach(key => {
    if (customer[key as keyof CustomerCreate] === undefined) {
      delete customer[key as keyof CustomerCreate];
    }
  });

  // All fields should now be included in the customer object
  const {
    vehicles, // Handle separately
    notes,    // Handle separately for detailed notes
    ...customerData
  } = customer;

  // Handle shop_id fallback logic
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

  // If there are vehicles, add them to the vehicles table
  if (vehicles && vehicles.length > 0) {
    for (const vehicle of vehicles) {
      if (vehicle.make && vehicle.model) { // Only add if minimal data is present
        try {
          // Fix: Convert year to number or null, but store it correctly as a number
          // The error was here - we need to make sure we're passing a number to the DB
          const vehicleYear = vehicle.year ? parseInt(vehicle.year.toString(), 10) : null;
          
          await supabase
            .from("vehicles")
            .insert({
              customer_id: data.id,
              make: vehicle.make,
              model: vehicle.model,
              year: vehicleYear,
              vin: vehicle.vin,
              license_plate: vehicle.license_plate
            });
        } catch (vehicleError) {
          console.error("Error adding vehicle:", vehicleError);
          // Don't throw to allow customer creation to succeed
        }
      }
    }
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

  return adaptCustomerForUI(data as Customer);
};
