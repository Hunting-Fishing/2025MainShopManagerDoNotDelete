
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

  // Extract vehicles to handle separately
  const { vehicles = [], notes, ...customerData } = customer;
  
  console.log("Processing customer creation with vehicles:", vehicles);
  
  // Ensure the role is always set to "Customer"
  customerData.role = "Customer";
  
  // Handle special case for business_industry and other_business_industry
  if (customerData.business_industry === 'other' && customerData.other_business_industry) {
    // We keep both fields to make reporting on "other" industries easier
    console.log(`Other business industry specified: ${customerData.other_business_industry}`);
  }

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

  // Now that we have the customer ID, handle vehicles
  if (vehicles && vehicles.length > 0) {
    console.log(`Adding ${vehicles.length} vehicles for customer ${data.id}`);
    
    for (const vehicle of vehicles) {
      // Only add vehicle if it has at least make and model
      if (vehicle.make && vehicle.model) {
        try {
          // Convert year to number or null, but store it correctly as a number
          const vehicleYear = vehicle.year ? parseInt(vehicle.year.toString(), 10) : null;
          
          console.log(`Adding vehicle: ${vehicleYear} ${vehicle.make} ${vehicle.model}`);
          
          const { error: vehicleError } = await supabase
            .from("vehicles")
            .insert({
              customer_id: data.id,
              make: vehicle.make,
              model: vehicle.model,
              year: vehicleYear,
              vin: vehicle.vin || null,
              license_plate: vehicle.license_plate || null
            });
            
          if (vehicleError) {
            console.error("Error adding vehicle:", vehicleError);
          }
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
