import { supabase } from "@/integrations/supabase/client";
import { Customer, CustomerCreate, adaptCustomerForUI } from "@/types/customer";
import { addCustomerNote } from "./customerNotesService";

export const createCustomer = async (customer: CustomerCreate): Promise<Customer> => {
  // Remove any undefined values to prevent Supabase errors
  Object.keys(customer).forEach(key => {
    if (customer[key as keyof CustomerCreate] === undefined) {
      delete customer[key as keyof CustomerCreate];
    }
  });

  // Extract vehicles to handle separately
  const { vehicles = [], notes, ...customerData } = customer;
  
  // Handle special case for business_industry and other_business_industry
  if (customerData.business_industry === 'other' && customerData.other_business_industry) {
    // Keep both fields to make reporting on "other" industries easier
  }

  // Handle shop_id fallback logic
  if (!customerData.shop_id) {
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
    
    if (!customerData.shop_id) {
      customerData.shop_id = '00000000-0000-0000-0000-000000000000';
    }
  }
  
  if (customerData.shop_id === 'DEFAULT-SHOP-ID') {
    customerData.shop_id = '00000000-0000-0000-0000-000000000000';
  }

  const { data, error } = await supabase
    .from("customers")
    .insert(customerData)
    .select()
    .single();

  if (error) {
    throw error;
  }

  // Handle vehicles
  if (vehicles && vehicles.length > 0) {
    for (const vehicle of vehicles) {
      if (vehicle.make && vehicle.model) {
        try {
          const vehicleYear = vehicle.year ? parseInt(vehicle.year.toString(), 10) : null;
          
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

  // Add customer note if provided
  if (notes && notes.trim()) {
    try {
      await addCustomerNote(data.id, notes, 'general', 'System');
    } catch (noteError) {
      console.error("Error adding initial customer note:", noteError);
    }
  }

  return adaptCustomerForUI(data as Customer);
};
