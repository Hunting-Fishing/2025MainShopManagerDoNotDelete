
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
    // Create the customer first
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .insert(customerData)
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
        ...vehicle,
        customer_id: customer.id
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
