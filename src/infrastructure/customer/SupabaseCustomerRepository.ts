
import { supabase } from '@/lib/supabase';
import { CustomerEntity } from '@/domain/customer/entities/Customer';
import { CustomerRepository, CustomerFilters } from '@/domain/customer/repositories/CustomerRepository';

export class SupabaseCustomerRepository implements CustomerRepository {
  async getAll(): Promise<CustomerEntity[]> {
    console.log('🔄 SupabaseCustomerRepository: Fetching all customers...');
    
    const { data: customers, error } = await supabase
      .from('customers')
      .select(`
        *,
        vehicles (
          id,
          year,
          make,
          model,
          vin,
          license_plate,
          color,
          body_style,
          fuel_type,
          engine,
          transmission,
          drive_type,
          gvwr,
          country,
          last_service_date,
          created_at,
          updated_at
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ SupabaseCustomerRepository: Error fetching customers:', error);
      throw new Error(`Failed to fetch customers: ${error.message}`);
    }

    console.log('✅ SupabaseCustomerRepository: Successfully fetched', customers?.length || 0, 'customers');

    return customers?.map(customer => {
      const vehicles = customer.vehicles?.map((vehicle: any) => ({
        id: vehicle.id,
        customer_id: customer.id,
        year: vehicle.year,
        make: vehicle.make,
        model: vehicle.model,
        vin: vehicle.vin,
        license_plate: vehicle.license_plate,
        color: vehicle.color,
        body_style: vehicle.body_style,
        fuel_type: vehicle.fuel_type,
        engine: vehicle.engine,
        transmission: vehicle.transmission,
        drive_type: vehicle.drive_type,
        gvwr: vehicle.gvwr,
        country: vehicle.country,
        last_service_date: vehicle.last_service_date,
        created_at: vehicle.created_at,
        updated_at: vehicle.updated_at
      })) || [];

      return CustomerEntity.fromDatabase({
        ...customer,
        vehicles
      });
    }) || [];
  }

  async getById(id: string): Promise<CustomerEntity | null> {
    console.log('🔄 SupabaseCustomerRepository: Fetching customer by ID:', id);
    
    const { data: customer, error } = await supabase
      .from('customers')
      .select(`
        *,
        vehicles (
          id,
          year,
          make,
          model,
          vin,
          license_plate,
          color,
          body_style,
          fuel_type,
          engine,
          transmission,
          drive_type,
          gvwr,
          country,
          last_service_date,
          created_at,
          updated_at
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        console.log('ℹ️ SupabaseCustomerRepository: Customer not found:', id);
        return null;
      }
      console.error('❌ SupabaseCustomerRepository: Error fetching customer:', error);
      throw new Error(`Failed to fetch customer: ${error.message}`);
    }

    if (!customer) {
      return null;
    }

    const vehicles = customer.vehicles?.map((vehicle: any) => ({
      id: vehicle.id,
      customer_id: customer.id,
      year: vehicle.year,
      make: vehicle.make,
      model: vehicle.model,
      vin: vehicle.vin,
      license_plate: vehicle.license_plate,
      color: vehicle.color,
      body_style: vehicle.body_style,
      fuel_type: vehicle.fuel_type,
      engine: vehicle.engine,
      transmission: vehicle.transmission,
      drive_type: vehicle.drive_type,
      gvwr: vehicle.gvwr,
      country: vehicle.country,
      last_service_date: vehicle.last_service_date,
      created_at: vehicle.created_at,
      updated_at: vehicle.updated_at
    })) || [];

    console.log('✅ SupabaseCustomerRepository: Successfully fetched customer');
    
    return CustomerEntity.fromDatabase({
      ...customer,
      vehicles
    });
  }

  async search(query: string): Promise<CustomerEntity[]> {
    console.log('🔄 SupabaseCustomerRepository: Searching customers with query:', query);
    
    const { data: customers, error } = await supabase
      .from('customers')
      .select(`
        *,
        vehicles (
          id,
          year,
          make,
          model,
          vin,
          license_plate,
          color,
          body_style,
          fuel_type,
          engine,
          transmission,
          drive_type,
          gvwr,
          country,
          last_service_date,
          created_at,
          updated_at
        )
      `)
      .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ SupabaseCustomerRepository: Error searching customers:', error);
      throw new Error(`Failed to search customers: ${error.message}`);
    }

    console.log('✅ SupabaseCustomerRepository: Successfully searched customers, found', customers?.length || 0, 'results');

    return customers?.map(customer => {
      const vehicles = customer.vehicles?.map((vehicle: any) => ({
        id: vehicle.id,
        customer_id: customer.id,
        year: vehicle.year,
        make: vehicle.make,
        model: vehicle.model,
        vin: vehicle.vin,
        license_plate: vehicle.license_plate,
        color: vehicle.color,
        body_style: vehicle.body_style,
        fuel_type: vehicle.fuel_type,
        engine: vehicle.engine,
        transmission: vehicle.transmission,
        drive_type: vehicle.drive_type,
        gvwr: vehicle.gvwr,
        country: vehicle.country,
        last_service_date: vehicle.last_service_date,
        created_at: vehicle.created_at,
        updated_at: vehicle.updated_at
      })) || [];

      return CustomerEntity.fromDatabase({
        ...customer,
        vehicles
      });
    }) || [];
  }

  async filter(filters: CustomerFilters): Promise<CustomerEntity[]> {
    console.log('🔄 SupabaseCustomerRepository: Filtering customers with filters:', filters);
    
    let query = supabase
      .from('customers')
      .select(`
        *,
        vehicles (
          id,
          year,
          make,
          model,
          vin,
          license_plate,
          color,
          body_style,
          fuel_type,
          engine,
          transmission,
          drive_type,
          gvwr,
          country,
          last_service_date,
          created_at,
          updated_at
        )
      `);

    // Apply search filter
    if (filters.search && filters.search.trim()) {
      const searchTerm = filters.search.trim();
      query = query.or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`);
    }

    // Apply date range filter
    if (filters.dateRange?.from) {
      query = query.gte('created_at', filters.dateRange.from.toISOString());
    }
    if (filters.dateRange?.to) {
      query = query.lte('created_at', filters.dateRange.to.toISOString());
    }

    const { data: customers, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('❌ SupabaseCustomerRepository: Error filtering customers:', error);
      throw new Error(`Failed to filter customers: ${error.message}`);
    }

    let filteredCustomers = customers?.map(customer => {
      const vehicles = customer.vehicles?.map((vehicle: any) => ({
        id: vehicle.id,
        customer_id: customer.id,
        year: vehicle.year,
        make: vehicle.make,
        model: vehicle.model,
        vin: vehicle.vin,
        license_plate: vehicle.license_plate,
        color: vehicle.color,
        body_style: vehicle.body_style,
        fuel_type: vehicle.fuel_type,
        engine: vehicle.engine,
        transmission: vehicle.transmission,
        drive_type: vehicle.drive_type,
        gvwr: vehicle.gvwr,
        country: vehicle.country,
        last_service_date: vehicle.last_service_date,
        created_at: vehicle.created_at,
        updated_at: vehicle.updated_at
      })) || [];

      return CustomerEntity.fromDatabase({
        ...customer,
        vehicles
      });
    }) || [];

    // Apply hasVehicles filter (client-side since it's based on relationship count)
    if (filters.hasVehicles && filters.hasVehicles !== '') {
      filteredCustomers = filteredCustomers.filter(customer => {
        const hasVehicles = customer.hasVehicles();
        return filters.hasVehicles === 'yes' ? hasVehicles : !hasVehicles;
      });
    }

    console.log('✅ SupabaseCustomerRepository: Successfully filtered customers, found', filteredCustomers.length, 'results');

    return filteredCustomers;
  }

  async create(customerData: Omit<CustomerEntity, 'id' | 'created_at' | 'updated_at' | 'fullName' | 'vehicleCount' | 'hasVehicles' | 'isFleetCustomer' | 'matchesSearch'>): Promise<CustomerEntity> {
    console.log('🔄 SupabaseCustomerRepository: Creating customer...');
    
    const { data: customer, error } = await supabase
      .from('customers')
      .insert([{
        first_name: customerData.first_name,
        last_name: customerData.last_name,
        email: customerData.email,
        phone: customerData.phone,
        address: customerData.address,
        city: customerData.city,
        state: customerData.state,
        postal_code: customerData.postal_code,
        country: customerData.country,
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
    
    return CustomerEntity.fromDatabase({
      ...customer,
      vehicles: []
    });
  }

  async update(id: string, customerData: Partial<CustomerEntity>): Promise<CustomerEntity> {
    console.log('🔄 SupabaseCustomerRepository: Updating customer:', id);
    
    const { data: customer, error } = await supabase
      .from('customers')
      .update({
        first_name: customerData.first_name,
        last_name: customerData.last_name,
        email: customerData.email,
        phone: customerData.phone,
        address: customerData.address,
        city: customerData.city,
        state: customerData.state,
        postal_code: customerData.postal_code,
        country: customerData.country,
        // Add other fields as needed
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ SupabaseCustomerRepository: Error updating customer:', error);
      throw new Error(`Failed to update customer: ${error.message}`);
    }

    console.log('✅ SupabaseCustomerRepository: Successfully updated customer');
    
    return CustomerEntity.fromDatabase({
      ...customer,
      vehicles: []
    });
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
