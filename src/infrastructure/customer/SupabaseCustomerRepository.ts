import { supabase } from '@/integrations/supabase/client';
import { CustomerRepository, CustomerFilters } from '@/domain/customer/repositories/CustomerRepository';
import { CustomerEntity, Customer } from '@/domain/customer/entities/Customer';
import { Database } from '@/integrations/supabase/types';

type SupabaseCustomer = Database['public']['Tables']['customers']['Row'];
type SupabaseCustomerInsert = Database['public']['Tables']['customers']['Insert'];
type SupabaseVehicle = Database['public']['Tables']['customer_vehicles']['Row'];

export class SupabaseCustomerRepository implements CustomerRepository {
  private mapSupabaseCustomerToEntity(
    supabaseCustomer: SupabaseCustomer,
    vehicles: SupabaseVehicle[] = []
  ): CustomerEntity {
    console.log('🔄 SupabaseCustomerRepository: Mapping customer', supabaseCustomer.id);
    
    const mappedVehicles = vehicles.map(vehicle => ({
      id: vehicle.id,
      customer_id: vehicle.customer_id,
      make: vehicle.make || '',
      model: vehicle.model || '',
      year: vehicle.year || 0,
      vin: vehicle.vin || '',
      license_plate: vehicle.license_plate || '',
      color: vehicle.color || '',
      engine_type: vehicle.engine_type || '',
      transmission: vehicle.transmission || '',
      fuel_type: vehicle.fuel_type || '',
      mileage: vehicle.mileage || 0,
      vehicle_type: vehicle.vehicle_type || '',
      notes: vehicle.notes || '',
      created_at: vehicle.created_at,
      updated_at: vehicle.updated_at,
    }));

    return new Customer(
      supabaseCustomer.id,
      supabaseCustomer.first_name,
      supabaseCustomer.last_name,
      supabaseCustomer.email || '',
      supabaseCustomer.phone || '',
      supabaseCustomer.address || '',
      supabaseCustomer.shop_id,
      supabaseCustomer.created_at,
      supabaseCustomer.updated_at,
      supabaseCustomer.city,
      supabaseCustomer.state,
      supabaseCustomer.postal_code,
      supabaseCustomer.country,
      supabaseCustomer.preferred_technician_id,
      supabaseCustomer.communication_preference,
      supabaseCustomer.referral_source,
      supabaseCustomer.referral_person_id,
      supabaseCustomer.other_referral_details,
      supabaseCustomer.household_id,
      supabaseCustomer.is_fleet,
      supabaseCustomer.fleet_company,
      supabaseCustomer.fleet_manager,
      supabaseCustomer.fleet_contact,
      supabaseCustomer.preferred_service_type,
      supabaseCustomer.notes,
      Array.isArray(supabaseCustomer.tags) ? supabaseCustomer.tags as string[] : [],
      Array.isArray(supabaseCustomer.segments) ? supabaseCustomer.segments as string[] : [],
      supabaseCustomer.company,
      supabaseCustomer.business_type,
      supabaseCustomer.business_industry,
      supabaseCustomer.other_business_industry,
      supabaseCustomer.tax_id,
      supabaseCustomer.business_email,
      supabaseCustomer.business_phone,
      supabaseCustomer.preferred_payment_method,
      supabaseCustomer.auto_billing,
      supabaseCustomer.credit_terms,
      supabaseCustomer.terms_agreed,
      mappedVehicles
    );
  }

  async getAll(): Promise<CustomerEntity[]> {
    console.log('🔄 SupabaseCustomerRepository: Fetching all customers');
    
    const { data: customers, error: customersError } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });

    if (customersError) {
      console.error('❌ SupabaseCustomerRepository: Error fetching customers:', customersError);
      throw new Error(`Failed to fetch customers: ${customersError.message}`);
    }

    if (!customers) {
      console.log('⚠️ SupabaseCustomerRepository: No customers found');
      return [];
    }

    // Fetch vehicles for all customers
    const { data: vehicles, error: vehiclesError } = await supabase
      .from('customer_vehicles')
      .select('*');

    if (vehiclesError) {
      console.warn('⚠️ SupabaseCustomerRepository: Error fetching vehicles:', vehiclesError);
    }

    // Group vehicles by customer_id
    const vehiclesByCustomer = vehicles?.reduce((acc, vehicle) => {
      if (!acc[vehicle.customer_id]) {
        acc[vehicle.customer_id] = [];
      }
      acc[vehicle.customer_id].push(vehicle);
      return acc;
    }, {} as Record<string, SupabaseVehicle[]>) || {};

    const mappedCustomers = customers.map(customer => 
      this.mapSupabaseCustomerToEntity(customer, vehiclesByCustomer[customer.id] || [])
    );

    console.log('✅ SupabaseCustomerRepository: Successfully fetched', mappedCustomers.length, 'customers');
    return mappedCustomers;
  }

  async getById(id: string): Promise<CustomerEntity | null> {
    console.log('🔄 SupabaseCustomerRepository: Fetching customer by ID:', id);
    
    const { data: customer, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('❌ SupabaseCustomerRepository: Error fetching customer:', error);
      return null;
    }

    if (!customer) {
      console.log('⚠️ SupabaseCustomerRepository: Customer not found:', id);
      return null;
    }

    // Fetch vehicles for this customer
    const { data: vehicles } = await supabase
      .from('customer_vehicles')
      .select('*')
      .eq('customer_id', id);

    return this.mapSupabaseCustomerToEntity(customer, vehicles || []);
  }

  async search(query: string): Promise<CustomerEntity[]> {
    console.log('🔄 SupabaseCustomerRepository: Searching customers:', query);
    
    const { data: customers, error } = await supabase
      .from('customers')
      .select('*')
      .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%,company.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ SupabaseCustomerRepository: Error searching customers:', error);
      throw new Error(`Failed to search customers: ${error.message}`);
    }

    if (!customers) {
      return [];
    }

    // Fetch vehicles for all customers
    const customerIds = customers.map(c => c.id);
    const { data: vehicles } = await supabase
      .from('customer_vehicles')
      .select('*')
      .in('customer_id', customerIds);

    // Group vehicles by customer_id
    const vehiclesByCustomer = vehicles?.reduce((acc, vehicle) => {
      if (!acc[vehicle.customer_id]) {
        acc[vehicle.customer_id] = [];
      }
      acc[vehicle.customer_id].push(vehicle);
      return acc;
    }, {} as Record<string, SupabaseVehicle[]>) || {};

    return customers.map(customer => 
      this.mapSupabaseCustomerToEntity(customer, vehiclesByCustomer[customer.id] || [])
    );
  }

  async filter(filters: CustomerFilters): Promise<CustomerEntity[]> {
    console.log('🔄 SupabaseCustomerRepository: Filtering customers with filters:', filters);
    
    let query = supabase.from('customers').select('*');

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

    const { data: customers, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('❌ SupabaseCustomerRepository: Error filtering customers:', error);
      throw new Error(`Failed to filter customers: ${error.message}`);
    }

    if (!customers) {
      return [];
    }

    // Fetch vehicles for all customers
    const customerIds = customers.map(c => c.id);
    const { data: vehicles } = await supabase
      .from('customer_vehicles')
      .select('*')
      .in('customer_id', customerIds);

    // Group vehicles by customer_id
    const vehiclesByCustomer = vehicles?.reduce((acc, vehicle) => {
      if (!acc[vehicle.customer_id]) {
        acc[vehicle.customer_id] = [];
      }
      acc[vehicle.customer_id].push(vehicle);
      return acc;
    }, {} as Record<string, SupabaseVehicle[]>) || {};

    let mappedCustomers = customers.map(customer => 
      this.mapSupabaseCustomerToEntity(customer, vehiclesByCustomer[customer.id] || [])
    );

    // Apply has vehicles filter (client-side since it depends on joined data)
    if (filters.hasVehicles && filters.hasVehicles !== '') {
      mappedCustomers = mappedCustomers.filter(customer => {
        const hasVehicles = customer.hasVehicles();
        return filters.hasVehicles === 'yes' ? hasVehicles : !hasVehicles;
      });
    }

    return mappedCustomers;
  }

  async create(customer: Omit<CustomerEntity, 'id' | 'created_at' | 'updated_at' | 'fullName' | 'vehicleCount' | 'hasVehicles' | 'isFleetCustomer' | 'matchesSearch'>): Promise<CustomerEntity> {
    console.log('🔄 SupabaseCustomerRepository: Creating customer');

    const customerToInsert: SupabaseCustomerInsert = {
      first_name: customer.first_name,
      last_name: customer.last_name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      shop_id: customer.shop_id,
      city: customer.city,
      state: customer.state,
      postal_code: customer.postal_code,
      country: customer.country,
      preferred_technician_id: customer.preferred_technician_id,
      communication_preference: customer.communication_preference,
      referral_source: customer.referral_source,
      referral_person_id: customer.referral_person_id,
      other_referral_details: customer.other_referral_details,
      household_id: customer.household_id,
      is_fleet: customer.is_fleet,
      fleet_company: customer.fleet_company,
      fleet_manager: customer.fleet_manager,
      fleet_contact: customer.fleet_contact,
      preferred_service_type: customer.preferred_service_type,
      notes: customer.notes,
      tags: customer.tags,
      segments: customer.segments,
      company: customer.company,
      business_type: customer.business_type,
      business_industry: customer.business_industry,
      other_business_industry: customer.other_business_industry,
      tax_id: customer.tax_id,
      business_email: customer.business_email,
      business_phone: customer.business_phone,
      preferred_payment_method: customer.preferred_payment_method,
      auto_billing: customer.auto_billing,
      credit_terms: customer.credit_terms,
      terms_agreed: customer.terms_agreed,
    };

    const { data, error } = await supabase
      .from('customers')
      .insert([customerToInsert])
      .select('*')
      .single();

    if (error) {
      console.error('❌ SupabaseCustomerRepository: Error creating customer:', error);
      throw new Error(`Failed to create customer: ${error.message}`);
    }

    if (!data) {
      console.error('❌ SupabaseCustomerRepository: No data returned after creating customer');
      throw new Error('Failed to create customer: No data returned');
    }

    return this.mapSupabaseCustomerToEntity(data);
  }

  async update(id: string, customer: Partial<CustomerEntity>): Promise<CustomerEntity> {
    console.log('🔄 SupabaseCustomerRepository: Updating customer with ID:', id);

    const customerToUpdate: Partial<SupabaseCustomerInsert> = {
      first_name: customer.first_name,
      last_name: customer.last_name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      city: customer.city,
      state: customer.state,
      postal_code: customer.postal_code,
      country: customer.country,
      preferred_technician_id: customer.preferred_technician_id,
      communication_preference: customer.communication_preference,
      referral_source: customer.referral_source,
      referral_person_id: customer.referral_person_id,
      other_referral_details: customer.other_referral_details,
      household_id: customer.household_id,
      is_fleet: customer.is_fleet,
      fleet_company: customer.fleet_company,
      fleet_manager: customer.fleet_manager,
      fleet_contact: customer.fleet_contact,
      preferred_service_type: customer.preferred_service_type,
      notes: customer.notes,
      tags: customer.tags,
      segments: customer.segments,
      company: customer.company,
      business_type: customer.business_type,
      business_industry: customer.business_industry,
      other_business_industry: customer.other_business_industry,
      tax_id: customer.tax_id,
      business_email: customer.business_email,
      business_phone: customer.business_phone,
      preferred_payment_method: customer.preferred_payment_method,
      auto_billing: customer.auto_billing,
      credit_terms: customer.credit_terms,
      terms_agreed: customer.terms_agreed,
    };

    // Remove undefined properties to avoid issues with Supabase
    Object.keys(customerToUpdate).forEach(key => {
      if (customerToUpdate[key] === undefined) {
        delete customerToUpdate[key];
      }
    });

    const { data, error } = await supabase
      .from('customers')
      .update(customerToUpdate)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('❌ SupabaseCustomerRepository: Error updating customer:', error);
      throw new Error(`Failed to update customer: ${error.message}`);
    }

    if (!data) {
      console.error('❌ SupabaseCustomerRepository: No data returned after updating customer');
      throw new Error('Failed to update customer: No data returned');
    }

    return this.mapSupabaseCustomerToEntity(data);
  }

  async delete(id: string): Promise<void> {
    console.log('🔄 SupabaseCustomerRepository: Deleting customer with ID:', id);

    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ SupabaseCustomerRepository: Error deleting customer:', error);
      throw new Error(`Failed to delete customer: ${error.message}`);
    }

    console.log('✅ SupabaseCustomerRepository: Customer deleted successfully:', id);
  }
}
