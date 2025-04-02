import { supabase } from "@/integrations/supabase/client";
import { Customer, adaptCustomerForUI } from "@/types/customer";
import { CustomerFormValues } from "@/components/customers/form/CustomerFormSchema";

// Update a customer
export const updateCustomer = async (id: string, updates: CustomerFormValues): Promise<Customer> => {
  // Format the data for the database - include all fields that exist in the customers table
  const customerData = {
    // Personal information
    first_name: updates.first_name,
    last_name: updates.last_name,
    email: updates.email,
    phone: updates.phone,
    
    // Address information
    address: updates.address,
    city: updates.city,
    state: updates.state,
    postal_code: updates.postal_code,
    country: updates.country,
    
    // Business information
    company: updates.company,
    shop_id: updates.shop_id,
    
    // Business details
    business_type: updates.business_type,
    business_industry: updates.business_industry,
    other_business_industry: updates.other_business_industry,
    tax_id: updates.tax_id,
    business_email: updates.business_email,
    business_phone: updates.business_phone,
    
    // Tags and preferences
    tags: updates.tags,
    preferred_technician_id: updates.preferred_technician_id || null,
    communication_preference: updates.communication_preference,
    
    // Referral information
    referral_source: updates.referral_source,
    referral_person_id: updates.referral_person_id || null,
    other_referral_details: updates.other_referral_details,
    
    // Household information
    household_id: updates.household_id || null,
    
    // Fleet information
    is_fleet: updates.is_fleet,
    fleet_company: updates.fleet_company,
    
    // Additional information
    notes: updates.notes
  };

  console.log("Updating customer with data:", customerData);

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

  // If the customer has vehicles, handle those separately
  if (updates.vehicles && updates.vehicles.length > 0) {
    try {
      // First get existing vehicles
      const { data: existingVehicles, error: vehiclesFetchError } = await supabase
        .from("vehicles")
        .select("id, make, model, year, vin, license_plate")
        .eq("customer_id", id);
        
      if (vehiclesFetchError) {
        console.error("Error fetching customer vehicles:", vehiclesFetchError);
      } else {
        // Create a map of existing vehicles for quick lookup
        const existingVehiclesMap = new Map();
        existingVehicles.forEach((vehicle, index) => {
          existingVehiclesMap.set(index, vehicle);
        });
        
        // Process each submitted vehicle
        for (let i = 0; i < updates.vehicles.length; i++) {
          const vehicle = updates.vehicles[i];
          const existingVehicle = existingVehiclesMap.get(i);
          
          // Convert year from string to number
          const vehicleYear = vehicle.year ? parseInt(vehicle.year, 10) : null;
          
          if (existingVehicle) {
            // Update existing vehicle
            await supabase
              .from("vehicles")
              .update({
                make: vehicle.make,
                model: vehicle.model,
                year: vehicleYear,
                vin: vehicle.vin,
                license_plate: vehicle.license_plate
              })
              .eq("id", existingVehicle.id);
          } else {
            // Insert new vehicle
            await supabase
              .from("vehicles")
              .insert({
                customer_id: id,
                make: vehicle.make,
                model: vehicle.model,
                year: vehicleYear,
                vin: vehicle.vin,
                license_plate: vehicle.license_plate
              });
          }
        }
        
        // If there are more existing vehicles than submitted ones, remove the extra ones
        if (existingVehicles.length > updates.vehicles.length) {
          for (let i = updates.vehicles.length; i < existingVehicles.length; i++) {
            const vehicleToRemove = existingVehiclesMap.get(i);
            if (vehicleToRemove) {
              await supabase
                .from("vehicles")
                .delete()
                .eq("id", vehicleToRemove.id);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error updating vehicles:", error);
      // We don't throw here to ensure the customer update still succeeds
    }
  }

  return adaptCustomerForUI(data as Customer);
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
