
import { supabase } from "@/lib/supabase";
import { Customer, CustomerCreate } from "@/types/customer";
import { CustomerFormValues } from "@/components/customers/form/schemas/customerSchema";

/**
 * Create a new customer
 */
export const createCustomer = async (customerData: CustomerFormValues): Promise<Customer> => {
  try {
    // Prepare data for insert
    const customerInsert: CustomerCreate = {
      first_name: customerData.first_name,
      last_name: customerData.last_name,
      email: customerData.email,
      phone: customerData.phone,
      address: customerData.address,
      city: customerData.city,
      state: customerData.state,
      postal_code: customerData.postal_code,
      country: customerData.country,
      company: customerData.company,
      business_type: customerData.business_type,
      business_industry: customerData.business_industry,
      other_business_industry: customerData.other_business_industry,
      tax_id: customerData.tax_id,
      business_email: customerData.business_email,
      business_phone: customerData.business_phone,
      preferred_payment_method: customerData.preferred_payment_method,
      auto_billing: customerData.auto_billing || false,
      credit_terms: customerData.credit_terms,
      terms_agreed: customerData.terms_agreed || false,
      notes: customerData.notes,
      shop_id: customerData.shop_id,
      tags: customerData.tags || [],
      preferred_technician_id: customerData.preferred_technician_id,
      communication_preference: customerData.communication_preference,
      referral_source: customerData.referral_source,
      referral_person_id: customerData.referral_person_id,
      other_referral_details: customerData.other_referral_details,
      household_id: customerData.household_id,
      is_fleet: customerData.is_fleet || false,
      fleet_company: customerData.fleet_company,
      fleet_manager: customerData.fleet_manager,
      fleet_contact: customerData.fleet_contact,
      preferred_service_type: customerData.preferred_service_type,
      segments: customerData.segments || []
    };
    
    console.log("Inserting customer:", customerInsert);
    const { data, error } = await supabase
      .from('customers')
      .insert(customerInsert)
      .select()
      .single();
    
    if (error) {
      console.error("Error creating customer:", error);
      throw new Error(`Failed to create customer: ${error.message}`);
    }
    
    if (!data) {
      throw new Error("No data returned from customer creation");
    }
    
    // Handle vehicles if present
    if (customerData.vehicles && customerData.vehicles.length > 0) {
      await addCustomerVehicles(data.id, customerData.vehicles);
    }
    
    return data as Customer;
  } catch (error: any) {
    console.error("Error in createCustomer service:", error);
    throw new Error(error.message || "Failed to create customer");
  }
};

/**
 * Add vehicles to a customer
 */
const addCustomerVehicles = async (customerId: string, vehicles: any[]) => {
  try {
    const vehiclesToInsert = vehicles.map(vehicle => ({
      customer_id: customerId,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year ? parseInt(vehicle.year) : null,
      vin: vehicle.vin,
      license_plate: vehicle.license_plate,
      color: vehicle.color,
      transmission: vehicle.transmission,
      drive_type: vehicle.drive_type,
      fuel_type: vehicle.fuel_type,
      engine: vehicle.engine,
      body_style: vehicle.body_style,
      country: vehicle.country
    }));
    
    console.log("Inserting vehicles:", vehiclesToInsert);
    const { error } = await supabase
      .from('customer_vehicles')
      .insert(vehiclesToInsert);
    
    if (error) {
      console.error("Error adding vehicles:", error);
      throw new Error(`Failed to add vehicles: ${error.message}`);
    }
  } catch (error: any) {
    console.error("Error in addCustomerVehicles:", error);
    throw new Error(error.message || "Failed to add vehicles");
  }
};

/**
 * Save draft customer data to local storage
 */
export const saveDraftCustomer = async (draftData: CustomerFormValues): Promise<void> => {
  try {
    localStorage.setItem('customerDraft', JSON.stringify(draftData));
  } catch (error) {
    console.error("Error saving draft customer:", error);
    throw new Error("Failed to save draft customer data");
  }
};

/**
 * Get draft customer data from local storage
 */
export const getDraftCustomer = async (): Promise<CustomerFormValues | null> => {
  try {
    const draft = localStorage.getItem('customerDraft');
    return draft ? JSON.parse(draft) : null;
  } catch (error) {
    console.error("Error getting draft customer:", error);
    return null;
  }
};

/**
 * Clear draft customer data from local storage
 */
export const clearDraftCustomer = async (): Promise<void> => {
  try {
    localStorage.removeItem('customerDraft');
  } catch (error) {
    console.error("Error clearing draft customer:", error);
  }
};

/**
 * Check for duplicate customers
 */
export const checkDuplicateCustomers = async (
  firstName: string, 
  lastName: string, 
  email?: string, 
  phone?: string
): Promise<Customer[]> => {
  try {
    let query = supabase
      .from('customers')
      .select('*');
    
    if (firstName && lastName) {
      query = query.or(`first_name.ilike.${firstName},last_name.ilike.${lastName}`);
    }
    
    if (email) {
      query = query.or(`email.ilike.${email}`);
    }
    
    if (phone) {
      query = query.or(`phone.eq.${phone}`);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error("Error checking for duplicate customers:", error);
      throw new Error(`Failed to check for duplicates: ${error.message}`);
    }
    
    return data as Customer[];
  } catch (error: any) {
    console.error("Error in checkDuplicateCustomers:", error);
    throw new Error(error.message || "Failed to check for duplicate customers");
  }
};
