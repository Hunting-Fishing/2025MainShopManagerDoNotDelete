
import { supabase } from '@/integrations/supabase/client';
import { Customer, CustomerCreate } from '@/types/customer';
import { CustomerVehicle } from '@/types/customer/vehicle';

export async function createCustomer(
  customerData: Partial<CustomerCreate>,
  vehicles: CustomerVehicle[] = []
): Promise<Customer | null> {
  console.log('Creating customer with data:', customerData);
  console.log('Creating vehicles:', vehicles);

  try {
    // Ensure required fields are present
    if (!customerData.first_name || !customerData.last_name) {
      throw new Error('First name and last name are required');
    }

    // Prepare customer data for database insertion
    const dbCustomerData: Record<string, any> = {
      first_name: customerData.first_name,
      last_name: customerData.last_name,
      email: customerData.email || '',
      phone: customerData.phone || '',
      address: customerData.address || '',
      city: customerData.city || '',
      state: customerData.state || '',
      postal_code: customerData.postal_code || '',
      country: customerData.country || '',
      company: customerData.company || '',
      business_type: customerData.business_type || '',
      business_industry: customerData.business_industry || '',
      other_business_industry: customerData.other_business_industry || '',
      tax_id: customerData.tax_id || '',
      business_email: customerData.business_email || '',
      business_phone: customerData.business_phone || '',
      preferred_payment_method: customerData.preferred_payment_method || '',
      auto_billing: customerData.auto_billing || false,
      credit_terms: customerData.credit_terms || '',
      terms_agreed: customerData.terms_agreed || false,
      is_fleet: customerData.is_fleet || false,
      fleet_company: customerData.fleet_company || '',
      fleet_manager: customerData.fleet_manager || '',
      fleet_contact: customerData.fleet_contact || '',
      preferred_service_type: customerData.preferred_service_type || '',
      notes: customerData.notes || '',
      shop_id: customerData.shop_id,
      preferred_technician_id: customerData.preferred_technician_id || '',
      communication_preference: customerData.communication_preference || '',
      referral_source: customerData.referral_source || '',
      referral_person_id: customerData.referral_person_id || '',
      other_referral_details: customerData.other_referral_details || '',
      household_id: customerData.household_id || '',
      tags: customerData.tags || [],
      segments: customerData.segments || []
    };

    // Create the customer first
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .insert(dbCustomerData)
      .select()
      .single();

    if (customerError) {
      console.error('Error creating customer:', customerError);
      throw new Error(`Failed to create customer: ${customerError.message}`);
    }

    console.log('Customer created successfully:', customer);

    // Create vehicles if any
    if (vehicles.length > 0) {
      const vehiclesWithCustomerId = vehicles.map(vehicle => ({
        customer_id: customer.id,
        year: typeof vehicle.year === 'string' ? parseInt(vehicle.year) || 0 : vehicle.year || 0,
        make: vehicle.make || '',
        model: vehicle.model || '',
        vin: vehicle.vin || '',
        license_plate: vehicle.license_plate || '',
        trim: vehicle.trim || '',
        transmission: vehicle.transmission || '',
        transmission_type: vehicle.transmission_type || '',
        drive_type: vehicle.drive_type || '',
        fuel_type: vehicle.fuel_type || '',
        engine: vehicle.engine || '',
        body_style: vehicle.body_style || '',
        country: vehicle.country || '',
        gvwr: vehicle.gvwr || '',
        color: vehicle.color || '',
        last_service_date: vehicle.last_service_date || '',
        notes: vehicle.notes || ''
      }));

      const { error: vehiclesError } = await supabase
        .from('vehicles')
        .insert(vehiclesWithCustomerId);

      if (vehiclesError) {
        console.error('Error creating vehicles:', vehiclesError);
        // Don't fail the whole operation, just log the error
        console.warn('Customer created but vehicles failed to create');
      } else {
        console.log('Vehicles created successfully');
      }
    }

    return customer;

  } catch (error) {
    console.error('Exception in createCustomer:', error);
    throw error;
  }
}
