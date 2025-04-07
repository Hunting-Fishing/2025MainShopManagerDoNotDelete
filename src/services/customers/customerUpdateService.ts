
import { supabase } from "@/integrations/supabase/client";
import { Customer, adaptCustomerForUI } from "@/types/customer";
import { CustomerFormValues } from "@/components/customers/form/CustomerFormSchema";

// Update a customer
export const updateCustomer = async (id: string, updates: CustomerFormValues): Promise<Customer> => {
  console.log("Updating customer with data:", updates);
  
  // Format the data for the database - include only fields that exist in the customers table
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
    business_type: updates.business_type,
    business_industry: updates.business_industry,
    other_business_industry: updates.other_business_industry,
    tax_id: updates.tax_id,
    business_email: updates.business_email,
    business_phone: updates.business_phone,
    
    // Payment & Billing
    preferred_payment_method: updates.preferred_payment_method,
    auto_billing: updates.auto_billing,
    credit_terms: updates.credit_terms,
    terms_agreed: updates.terms_agreed,
    
    // Shop assignment
    shop_id: updates.shop_id,
    
    // Tags and preferences
    tags: updates.tags,
    segments: updates.segments,
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
    fleet_manager: updates.fleet_manager,
    fleet_contact: updates.fleet_contact,
    preferred_service_type: updates.preferred_service_type,
    
    // Additional information
    notes: updates.notes
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

  // If the customer has vehicles, handle those separately
  if (updates.vehicles && updates.vehicles.length > 0) {
    try {
      // First get existing vehicles
      const { data: existingVehicles, error: vehiclesFetchError } = await supabase
        .from("vehicles")
        .select("*")
        .eq("customer_id", id);
        
      if (vehiclesFetchError) {
        console.error("Error fetching customer vehicles:", vehiclesFetchError);
      } else {
        console.log("Found existing vehicles:", existingVehicles);
        
        // Process each submitted vehicle
        for (let i = 0; i < updates.vehicles.length; i++) {
          const vehicle = updates.vehicles[i];
          
          // Skip empty vehicles
          if (!vehicle.make && !vehicle.model && !vehicle.year && !vehicle.vin && !vehicle.license_plate) {
            continue;
          }
          
          // Convert year from string to number
          const vehicleYear = vehicle.year ? parseInt(vehicle.year, 10) : null;
          
          // Find if this vehicle already exists for the customer
          const existingVehicleIndex = existingVehicles?.findIndex(v => 
            v.make === vehicle.make && 
            v.model === vehicle.model &&
            (v.vin === vehicle.vin || (v.vin === null && vehicle.vin === ""))
          );
          
          if (existingVehicleIndex >= 0 && existingVehicles) {
            // Update existing vehicle
            const existingVehicle = existingVehicles[existingVehicleIndex];
            console.log(`Updating vehicle: ${vehicleYear} ${vehicle.make} ${vehicle.model}`, existingVehicle.id);
            
            const { error: updateError } = await supabase
              .from("vehicles")
              .update({
                make: vehicle.make,
                model: vehicle.model,
                year: vehicleYear,
                vin: vehicle.vin || null,
                license_plate: vehicle.license_plate || null
              })
              .eq("id", existingVehicle.id);
              
            if (updateError) {
              console.error("Error updating vehicle:", updateError);
            }
          } else {
            // Insert new vehicle
            console.log(`Adding new vehicle: ${vehicleYear} ${vehicle.make} ${vehicle.model}`);
            
            const { error: insertError } = await supabase
              .from("vehicles")
              .insert({
                customer_id: id,
                make: vehicle.make,
                model: vehicle.model,
                year: vehicleYear,
                vin: vehicle.vin || null,
                license_plate: vehicle.license_plate || null
              });
              
            if (insertError) {
              console.error("Error adding vehicle:", insertError);
            }
          }
        }
        
        // Delete vehicles that were removed in the UI
        const vehiclesToKeep = new Set();
        
        updates.vehicles.forEach(vehicle => {
          if (vehicle.make && vehicle.model) {
            const key = `${vehicle.make}-${vehicle.model}-${vehicle.vin || ""}`;
            vehiclesToKeep.add(key);
          }
        });
        
        for (const existingVehicle of (existingVehicles || [])) {
          const key = `${existingVehicle.make}-${existingVehicle.model}-${existingVehicle.vin || ""}`;
          if (!vehiclesToKeep.has(key)) {
            console.log(`Deleting vehicle: ${existingVehicle.year} ${existingVehicle.make} ${existingVehicle.model}`);
            
            const { error: deleteError } = await supabase
              .from("vehicles")
              .delete()
              .eq("id", existingVehicle.id);
              
            if (deleteError) {
              console.error("Error deleting vehicle:", deleteError);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error processing vehicles:", error);
    }
  }

  return adaptCustomerForUI(data as Customer);
};

// Delete a customer
export const deleteCustomer = async (id: string): Promise<void> => {
  // First delete related vehicles
  try {
    const { error: vehiclesError } = await supabase
      .from("vehicles")
      .delete()
      .eq("customer_id", id);
      
    if (vehiclesError) {
      console.error("Error deleting customer vehicles:", vehiclesError);
    }
  } catch (error) {
    console.error("Error deleting customer vehicles:", error);
  }
  
  // Delete customer notes
  try {
    const { error: notesError } = await supabase
      .from("customer_notes")
      .delete()
      .eq("customer_id", id);
      
    if (notesError) {
      console.error("Error deleting customer notes:", notesError);
    }
  } catch (error) {
    console.error("Error deleting customer notes:", error);
  }
  
  // Finally delete the customer
  const { error } = await supabase
    .from("customers")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting customer:", error);
    throw error;
  }
};
