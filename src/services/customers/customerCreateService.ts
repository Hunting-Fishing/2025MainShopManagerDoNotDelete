
import { supabase } from "@/integrations/supabase/client";
import { Customer, CustomerCreate, adaptCustomerForUI } from "@/types/customer";
import { addCustomerNote } from "./customerNotesService";

// Create a new customer
export const createCustomer = async (customer: CustomerCreate): Promise<Customer> => {
  console.log("Creating customer with data:", customer);
  
  // Extract vehicles to handle separately
  const { vehicles = [], notes, ...customerData } = customer;
  
  // Ensure the role is always set to "Customer"
  customerData.role = "Customer";
  
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
          // Convert year to number or null
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
        }
      }
    }
  }

  // If there's a note, add it to the customer_notes table
  if (notes && notes.trim()) {
    try {
      // Create the note data object according to the API requirements
      const noteData = {
        customer_id: data.id,
        content: notes.trim(),
        category: 'general',
        created_by: 'System'
      };
      
      // Call addCustomerNote with the correct parameter structure
      await addCustomerNote(noteData);
    } catch (noteError) {
      console.error("Error adding initial customer note:", noteError);
    }
  }

  return adaptCustomerForUI(data as Customer);
};
