
import { supabase } from '@/lib/supabase';
import { CustomerRepository, CustomerFilters } from '@/domain/customer/repositories/CustomerRepository';
import { CustomerEntity, Customer } from '@/domain/customer/entities/Customer';
import { Customer as CustomerType, CustomerVehicle } from '@/types/customer';

export class SupabaseCustomerRepository implements CustomerRepository {
  private mapToEntity(data: CustomerType): CustomerEntity {
    // Map the database data to our domain entity
    return new Customer(
      data.id,
      data.first_name,
      data.last_name,
      data.email,
      data.phone,
      data.address,
      data.shop_id,
      data.created_at,
      data.updated_at,
      data.city,
      data.state,
      data.postal_code,
      data.country,
      data.preferred_technician_id,
      data.communication_preference,
      data.referral_source,
      data.referral_person_id,
      data.other_referral_details,
      data.household_id,
      data.is_fleet,
      data.fleet_company,
      data.fleet_manager,
      data.fleet_contact,
      data.preferred_service_type,
      data.notes,
      Array.isArray(data.tags) ? data.tags : [],
      Array.isArray(data.segments) ? data.segments : [],
      data.company,
      data.business_type,
      data.business_industry,
      data.other_business_industry,
      data.tax_id,
      data.business_email,
      data.business_phone,
      data.preferred_payment_method,
      data.auto_billing,
      data.credit_terms,
      data.terms_agreed,
      data.vehicles || []
    );
  }

  async getAll(): Promise<CustomerEntity[]> {
    console.log('🔄 SupabaseCustomerRepository: Fetching all customers...');
    
    const { data, error } = await supabase
      .from('customers')
      .select(`
        *,
        vehicles:customer_vehicles(*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ SupabaseCustomerRepository: Error fetching customers:', error);
      throw new Error(`Failed to fetch customers: ${error.message}`);
    }

    if (!data) {
      console.log('⚠️ SupabaseCustomerRepository: No customers found');
      return [];
    }

    console.log('✅ SupabaseCustomerRepository: Successfully fetched', data.length, 'customers');
    return data.map(customer => this.mapToEntity(customer));
  }

  async getById(id: string): Promise<CustomerEntity | null> {
    const { data, error } = await supabase
      .from('customers')
      .select(`
        *,
        vehicles:customer_vehicles(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Failed to fetch customer: ${error.message}`);
    }

    return data ? this.mapToEntity(data) : null;
  }

  async search(query: string): Promise<CustomerEntity[]> {
    const { data, error } = await supabase
      .from('customers')
      .select(`
        *,
        vehicles:customer_vehicles(*)
      `)
      .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%,company.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to search customers: ${error.message}`);
    }

    return data ? data.map(customer => this.mapToEntity(customer)) : [];
  }

  async filter(filters: CustomerFilters): Promise<CustomerEntity[]> {
    let query = supabase
      .from('customers')
      .select(`
        *,
        vehicles:customer_vehicles(*)
      `);

    // Apply search filter
    if (filters.search) {
      query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
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
      throw new Error(`Failed to filter customers: ${error.message}`);
    }

    let customers = data ? data.map(customer => this.mapToEntity(customer)) : [];

    // Apply client-side filters that are complex for SQL
    if (filters.hasVehicles && filters.hasVehicles !== '') {
      customers = customers.filter(customer => {
        const hasVehicles = customer.hasVehicles();
        return filters.hasVehicles === 'yes' ? hasVehicles : !hasVehicles;
      });
    }

    return customers;
  }

  async create(customerData: Omit<CustomerEntity, 'id' | 'created_at' | 'updated_at' | 'fullName' | 'vehicleCount' | 'hasVehicles' | 'isFleetCustomer' | 'matchesSearch'>): Promise<CustomerEntity> {
    const { data, error } = await supabase
      .from('customers')
      .insert([customerData])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create customer: ${error.message}`);
    }

    return this.mapToEntity(data);
  }

  async update(id: string, customerData: Partial<CustomerEntity>): Promise<CustomerEntity> {
    const { data, error } = await supabase
      .from('customers')
      .update(customerData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update customer: ${error.message}`);
    }

    return this.mapToEntity(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete customer: ${error.message}`);
    }
  }
}
