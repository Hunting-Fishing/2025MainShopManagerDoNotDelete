
import { supabase } from '@/integrations/supabase/client';
import { CustomerEntity, Customer } from '@/domain/customer/entities/Customer';
import { CustomerRepository, CustomerFilters } from '@/domain/customer/repositories/CustomerRepository';
import { CustomerVehicle } from '@/types/customer';

export class SupabaseCustomerRepository implements CustomerRepository {
  private async adaptCustomerToEntity(customerData: any): Promise<CustomerEntity> {
    console.log('🔄 SupabaseCustomerRepository: Adapting customer data:', customerData);
    
    // Fetch vehicles for this customer
    const { data: vehicles, error: vehiclesError } = await supabase
      .from('vehicles')
      .select('*')
      .eq('customer_id', customerData.id);

    if (vehiclesError) {
      console.error('Error fetching vehicles:', vehiclesError);
    }

    const customerVehicles: CustomerVehicle[] = vehicles?.map(vehicle => ({
      id: vehicle.id,
      customer_id: vehicle.customer_id,
      year: vehicle.year,
      make: vehicle.make,
      model: vehicle.model,
      vin: vehicle.vin,
      license_plate: vehicle.license_plate,
      color: vehicle.color,
      engine: vehicle.engine,
      transmission: vehicle.transmission,
      fuel_type: vehicle.fuel_type,
      mileage: vehicle.mileage,
      notes: vehicle.notes,
      created_at: vehicle.created_at,
      updated_at: vehicle.updated_at
    })) || [];

    return new Customer(
      customerData.id,
      customerData.first_name,
      customerData.last_name,
      customerData.email,
      customerData.phone,
      customerData.address,
      customerData.shop_id,
      customerData.created_at,
      customerData.updated_at,
      customerData.city,
      customerData.state,
      customerData.postal_code,
      customerData.country,
      customerData.preferred_technician_id,
      customerData.communication_preference,
      customerData.referral_source,
      customerData.referral_person_id,
      customerData.other_referral_details,
      customerData.household_id,
      customerData.is_fleet,
      customerData.fleet_company,
      customerData.fleet_manager,
      customerData.fleet_contact,
      customerData.preferred_service_type,
      customerData.notes,
      customerData.tags,
      customerData.segments,
      customerData.company,
      customerData.business_type,
      customerData.business_industry,
      customerData.other_business_industry,
      customerData.tax_id,
      customerData.business_email,
      customerData.business_phone,
      customerData.preferred_payment_method,
      customerData.auto_billing,
      customerData.credit_terms,
      customerData.terms_agreed,
      customerVehicles
    );
  }

  async getAll(): Promise<CustomerEntity[]> {
    console.log('🔄 SupabaseCustomerRepository: Fetching all customers');
    
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ SupabaseCustomerRepository: Error fetching customers:', error);
      throw new Error(`Failed to fetch customers: ${error.message}`);
    }

    if (!data || data.length === 0) {
      console.log('ℹ️ SupabaseCustomerRepository: No customers found');
      return [];
    }

    console.log('✅ SupabaseCustomerRepository: Successfully fetched', data.length, 'customers');
    
    // Adapt each customer to entity with vehicles
    const customerEntities = await Promise.all(
      data.map(customer => this.adaptCustomerToEntity(customer))
    );

    return customerEntities;
  }

  async getById(id: string): Promise<CustomerEntity | null> {
    console.log('🔄 SupabaseCustomerRepository: Fetching customer by ID:', id);
    
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('❌ SupabaseCustomerRepository: Error fetching customer:', error);
      return null;
    }

    if (!data) {
      console.log('ℹ️ SupabaseCustomerRepository: Customer not found');
      return null;
    }

    console.log('✅ SupabaseCustomerRepository: Successfully fetched customer');
    return this.adaptCustomerToEntity(data);
  }

  async search(query: string): Promise<CustomerEntity[]> {
    console.log('🔄 SupabaseCustomerRepository: Searching customers with query:', query);
    
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%,company.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ SupabaseCustomerRepository: Error searching customers:', error);
      throw new Error(`Failed to search customers: ${error.message}`);
    }

    if (!data || data.length === 0) {
      console.log('ℹ️ SupabaseCustomerRepository: No customers found for search query');
      return [];
    }

    console.log('✅ SupabaseCustomerRepository: Successfully found', data.length, 'customers');
    
    // Adapt each customer to entity with vehicles
    const customerEntities = await Promise.all(
      data.map(customer => this.adaptCustomerToEntity(customer))
    );

    return customerEntities;
  }

  async filter(filters: CustomerFilters): Promise<CustomerEntity[]> {
    console.log('🔄 SupabaseCustomerRepository: Filtering customers with filters:', filters);
    
    let query = supabase
      .from('customers')
      .select('*');

    // Apply search filter
    if (filters.search && filters.search.trim()) {
      const searchTerm = filters.search.trim();
      query = query.or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%,company.ilike.%${searchTerm}%`);
    }

    // Apply date range filter
    if (filters.dateRange?.from) {
      query = query.gte('created_at', filters.dateRange.from.toISOString());
    }
    if (filters.dateRange?.to) {
      query = query.lte('created_at', filters.dateRange.to.toISOString());
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('❌ SupabaseCustomerRepository: Error filtering customers:', error);
      throw new Error(`Failed to filter customers: ${error.message}`);
    }

    if (!data || data.length === 0) {
      console.log('ℹ️ SupabaseCustomerRepository: No customers found for filters');
      return [];
    }

    console.log('✅ SupabaseCustomerRepository: Successfully filtered', data.length, 'customers');
    
    // Adapt each customer to entity with vehicles
    let customerEntities = await Promise.all(
      data.map(customer => this.adaptCustomerToEntity(customer))
    );

    // Apply has vehicles filter (post-processing since we need to check vehicle count)
    if (filters.hasVehicles && filters.hasVehicles !== '') {
      customerEntities = customerEntities.filter(customer => {
        const hasVehicles = customer.hasVehicles();
        return filters.hasVehicles === 'yes' ? hasVehicles : !hasVehicles;
      });
    }

    return customerEntities;
  }

  async create(customerData: Omit<CustomerEntity, 'id' | 'created_at' | 'updated_at' | 'fullName' | 'vehicleCount' | 'hasVehicles' | 'isFleetCustomer' | 'matchesSearch'>): Promise<CustomerEntity> {
    console.log('🔄 SupabaseCustomerRepository: Creating new customer');
    
    const { data, error } = await supabase
      .from('customers')
      .insert([{
        first_name: customerData.first_name,
        last_name: customerData.last_name,
        email: customerData.email,
        phone: customerData.phone,
        address: customerData.address,
        shop_id: customerData.shop_id,
        // Add other fields as needed
      }])
      .select()
      .single();

    if (error) {
      console.error('❌ SupabaseCustomerRepository: Error creating customer:', error);
      throw new Error(`Failed to create customer: ${error.message}`);
    }

    console.log('✅ SupabaseCustomerRepository: Successfully created customer');
    return this.adaptCustomerToEntity(data);
  }

  async update(id: string, customerData: Partial<CustomerEntity>): Promise<CustomerEntity> {
    console.log('🔄 SupabaseCustomerRepository: Updating customer:', id);
    
    const { data, error } = await supabase
      .from('customers')
      .update(customerData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ SupabaseCustomerRepository: Error updating customer:', error);
      throw new Error(`Failed to update customer: ${error.message}`);
    }

    console.log('✅ SupabaseCustomerRepository: Successfully updated customer');
    return this.adaptCustomerToEntity(data);
  }

  async delete(id: string): Promise<void> {
    console.log('🔄 SupabaseCustomerRepository: Deleting customer:', id);
    
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ SupabaseCustomerRepository: Error deleting customer:', error);
      throw new Error(`Failed to delete customer: ${error.message}`);
    }

    console.log('✅ SupabaseCustomerRepository: Successfully deleted customer');
  }
}
