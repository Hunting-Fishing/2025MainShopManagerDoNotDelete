
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

  // Extract vehicles and fields that don't belong in customers table
  const { 
    vehicles = [], 
    notes,
    // Remove business fields that have complex objects
    business_type,
    business_industry,
    other_business_industry,
    tax_id,
    business_email,
    business_phone,
    // Remove payment fields
    preferred_payment_method,
    auto_billing,
    credit_terms,
    terms_agreed,
    // Remove fleet fields
    fleet_manager,
    fleet_contact,
    preferred_service_type,
    // Remove preference fields
    communication_preference,
    // Remove referral fields  
    referral_source,
    other_referral_details,
    // Remove tags and segments
    tags,
    segments,
    ...customerData 
  } = customer;

  // Only include fields that actually exist in the customers table
  const cleanCustomerData = {
    first_name: customerData.first_name,
    last_name: customerData.last_name,
    email: customerData.email || '',
    phone: customerData.phone || '',
    address: customerData.address || '',
    shop_id: customerData.shop_id,
    // Convert empty strings to null for UUID fields
    preferred_technician_id: customerData.preferred_technician_id || null,
    referral_person_id: customerData.referral_person_id || null,
    household_id: customerData.household_id || null,
    is_fleet: customerData.is_fleet || false,
    fleet_company: customerData.fleet_company || ''
  };

  // Handle shop_id fallback logic - get real shop data
  if (!cleanCustomerData.shop_id) {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('shop_id')
        .eq('id', user.id)
        .single();
      
      if (profile && profile.shop_id) {
        cleanCustomerData.shop_id = profile.shop_id;
      } else {
        // Get the first available shop from the database
        const { data: shops } = await supabase
          .from('shops')
          .select('id')
          .limit(1);
        
        if (shops && shops.length > 0) {
          cleanCustomerData.shop_id = shops[0].id;
        } else {
          throw new Error('No shops found. Please create a shop first.');
        }
      }
    }
    
    if (!cleanCustomerData.shop_id) {
      throw new Error('Unable to determine shop_id. Please ensure you have a valid shop setup.');
    }
  }

  const { data, error } = await supabase
    .from("customers")
    .insert(cleanCustomerData)
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
