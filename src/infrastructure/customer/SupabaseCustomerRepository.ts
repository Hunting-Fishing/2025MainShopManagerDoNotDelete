
import { CustomerRepository, CustomerFilters } from '@/domain/customer/repositories/CustomerRepository';
import { CustomerEntity, Customer } from '@/domain/customer/entities/Customer';
import { supabase } from '@/integrations/supabase/client';
import { Customer as SupabaseCustomer } from '@/types/customer';

export class SupabaseCustomerRepository implements CustomerRepository {
  async getAll(): Promise<CustomerEntity[]> {
    console.log('🔄 SupabaseCustomerRepository: Fetching all customers...');
    
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error('❌ Authentication error:', authError);
        throw new Error(`Authentication failed: ${authError.message}`);
      }

      if (!user) {
        console.warn('⚠️ No authenticated user found');
        return [];
      }

      const { data, error } = await supabase
        .from('customers')
        .select(`
          *,
          vehicles(*)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching customers:', error);
        throw error;
      }

      console.log('✅ Successfully fetched', data?.length || 0, 'customers');
      return (data || []).map(this.mapToEntity);
    } catch (error) {
      console.error('❌ Exception in getAll:', error);
      throw error;
    }
  }

  async getById(id: string): Promise<CustomerEntity | null> {
    console.log('🔍 SupabaseCustomerRepository: Fetching customer with id:', id);
    
    try {
      const { data, error } = await supabase
        .from('customers')
        .select(`
          *,
          vehicles(*)
        `)
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.error('❌ Error fetching customer by ID:', error);
        throw error;
      }

      console.log('✅ Found customer:', data ? 'Yes' : 'No');
      return data ? this.mapToEntity(data) : null;
    } catch (error) {
      console.error('❌ Exception in getById:', error);
      throw error;
    }
  }

  async search(query: string): Promise<CustomerEntity[]> {
    console.log('🔍 SupabaseCustomerRepository: Searching customers with query:', query);
    
    try {
      const searchTerm = query.trim();
      
      const { data, error } = await supabase
        .from('customers')
        .select(`
          *,
          vehicles(*)
        `)
        .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`)
        .limit(50)
        .order('last_name', { ascending: true });
      
      if (error) {
        console.error('❌ Error searching customers:', error);
        throw error;
      }
      
      console.log('✅ Found', data?.length || 0, 'customers matching search');
      return (data || []).map(this.mapToEntity);
    } catch (error) {
      console.error('❌ Exception in search:', error);
      throw error;
    }
  }

  async filter(filters: CustomerFilters): Promise<CustomerEntity[]> {
    console.log('🔍 SupabaseCustomerRepository: Filtering customers with filters:', filters);
    
    try {
      let query = supabase
        .from('customers')
        .select(`
          *,
          vehicles(*)
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

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('❌ Error filtering customers:', error);
        throw error;
      }

      let customers = (data || []).map(this.mapToEntity);

      // Apply client-side filters that can't be done in SQL
      if (filters.hasVehicles && filters.hasVehicles !== '') {
        customers = customers.filter(customer => {
          const hasVehicles = customer.hasVehicles();
          return filters.hasVehicles === 'yes' ? hasVehicles : !hasVehicles;
        });
      }

      console.log('✅ Filtered to', customers.length, 'customers');
      return customers;
    } catch (error) {
      console.error('❌ Exception in filter:', error);
      throw error;
    }
  }

  async create(customerData: Omit<CustomerEntity, 'id' | 'created_at' | 'updated_at' | 'fullName' | 'vehicleCount'>): Promise<CustomerEntity> {
    console.log('➕ SupabaseCustomerRepository: Creating customer');
    
    try {
      const { data, error } = await supabase
        .from('customers')
        .insert([customerData])
        .select(`
          *,
          vehicles(*)
        `)
        .single();

      if (error) {
        console.error('❌ Error creating customer:', error);
        throw error;
      }

      console.log('✅ Successfully created customer');
      return this.mapToEntity(data);
    } catch (error) {
      console.error('❌ Exception in create:', error);
      throw error;
    }
  }

  async update(id: string, customerData: Partial<CustomerEntity>): Promise<CustomerEntity> {
    console.log('✏️ SupabaseCustomerRepository: Updating customer with id:', id);
    
    try {
      const { data, error } = await supabase
        .from('customers')
        .update(customerData)
        .eq('id', id)
        .select(`
          *,
          vehicles(*)
        `)
        .single();

      if (error) {
        console.error('❌ Error updating customer:', error);
        throw error;
      }

      console.log('✅ Successfully updated customer');
      return this.mapToEntity(data);
    } catch (error) {
      console.error('❌ Exception in update:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    console.log('🗑️ SupabaseCustomerRepository: Deleting customer with id:', id);
    
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Error deleting customer:', error);
        throw error;
      }

      console.log('✅ Successfully deleted customer');
    } catch (error) {
      console.error('❌ Exception in delete:', error);
      throw error;
    }
  }

  private mapToEntity(data: any): CustomerEntity {
    return new Customer(
      data.id,
      data.first_name,
      data.last_name,
      data.email || '',
      data.phone || '',
      data.address || '',
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
      Array.isArray(data.tags) ? data.tags : (data.tags ? [data.tags] : []),
      Array.isArray(data.segments) ? data.segments : (data.segments ? [data.segments] : []),
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
}
