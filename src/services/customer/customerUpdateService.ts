import { supabase } from "@/lib/supabase";
import { Customer, adaptCustomerForUI } from "@/types/customer";
import { CustomerFormValues } from "@/components/customers/form/schemas/customerSchema";

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
  let vehiclesUpdated = 0;
  if (updates.vehicles && updates.vehicles.length > 0) {
    // First get existing vehicles
    const { data: existingVehicles, error: vehiclesFetchError } = await supabase
      .from("vehicles")
      .select("id, make, model, year, vin, license_plate, color, transmission, drive_type, fuel_type, engine, body_style, country, transmission_type, gvwr")
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
          // Update existing vehicle with all fields
          await supabase
            .from("vehicles")
            .update({
              make: vehicle.make,
              model: vehicle.model,
              year: vehicleYear,
              vin: vehicle.vin,
              license_plate: vehicle.license_plate,
              color: vehicle.color,
              transmission: vehicle.transmission,
              drive_type: vehicle.drive_type,
              fuel_type: vehicle.fuel_type,
              engine: vehicle.engine,
              body_style: vehicle.body_style,
              country: vehicle.country,
              transmission_type: vehicle.transmission_type,
              gvwr: vehicle.gvwr
            })
            .eq("id", existingVehicle.id);
        } else {
          // Insert new vehicle with all fields
          await supabase
            .from("vehicles")
            .insert({
              customer_id: id,
              make: vehicle.make,
              model: vehicle.model,
              year: vehicleYear,
              vin: vehicle.vin,
              license_plate: vehicle.license_plate,
              color: vehicle.color,
              transmission: vehicle.transmission,
              drive_type: vehicle.drive_type,
              fuel_type: vehicle.fuel_type,
              engine: vehicle.engine,
              body_style: vehicle.body_style,
              country: vehicle.country,
              transmission_type: vehicle.transmission_type,
              gvwr: vehicle.gvwr
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
  }

  // Fetch the updated customer with vehicles
  const { data: updatedCustomer, error: fetchError } = await supabase
    .from("customers")
    .select(`
      *,
      vehicles(*)
    `)
    .eq("id", id)
    .single();
    
  if (fetchError) {
    console.error("Error fetching updated customer:", fetchError);
    return adaptCustomerForUI(data as Customer);
  }

  // Check if we need to update preferred technician history
  if (updates.preferred_technician_id) {
    try {
      const { data: prevTechnicianHistory } = await supabase
        .from("preferred_technician_history")
        .select("*")
        .eq("customer_id", id)
        .order("change_date", { ascending: false })
        .limit(1);
        
      // If history entry exists and it's different, create a new entry
      if (prevTechnicianHistory && prevTechnicianHistory.length > 0) {
        const lastEntry = prevTechnicianHistory[0];
        if (lastEntry.new_technician_id !== updates.preferred_technician_id) {
          // Find technician name
          const techInfo = technicians.find(t => t.id === updates.preferred_technician_id);
          
          await supabase.from("preferred_technician_history").insert({
            customer_id: id,
            previous_technician_id: lastEntry.new_technician_id,
            previous_technician_name: lastEntry.new_technician_name,
            new_technician_id: updates.preferred_technician_id,
            new_technician_name: techInfo ? techInfo.name : "Unknown",
            changed_by_id: "system", // Ideally we'd get the current user ID
            changed_by_name: "System",
            change_date: new Date().toISOString()
          });
        }
      } else {
        // No history yet, create first entry
        const techInfo = technicians.find(t => t.id === updates.preferred_technician_id);
        
        await supabase.from("preferred_technician_history").insert({
          customer_id: id,
          new_technician_id: updates.preferred_technician_id,
          new_technician_name: techInfo ? techInfo.name : "Unknown",
          changed_by_id: "system", // Ideally we'd get the current user ID
          changed_by_name: "System",
          change_date: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error("Error updating technician history:", error);
    }
  }

  return adaptCustomerForUI(updatedCustomer as Customer);
};

// Get technician data for the system
const technicians = [
  { id: "TM001", name: "John Smith" },
  { id: "TM002", name: "Sarah Johnson" },
  { id: "TM003", name: "Michael Brown" },
  { id: "TM004", name: "Emily Chen" },
  { id: "TM005", name: "David Lee" },
];

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
