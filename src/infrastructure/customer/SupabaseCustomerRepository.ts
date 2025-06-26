
import { supabase } from '@/integrations/supabase/client';
import { CustomerRepository, CustomerFilters } from '@/domain/customer/repositories/CustomerRepository';
import { CustomerEntity, Customer } from '@/domain/customer/entities/Customer';
import { CustomerVehicle } from '@/types/customer';

export class SupabaseCustomerRepository implements CustomerRepository {
  private convertToCustomerEntity(dbCustomer: any): CustomerEntity {
    // Ensure vehicles is always an array
    const vehicles: CustomerVehicle[] = Array.isArray(dbCustomer.vehicles) ? dbCustomer.vehicles : [];
    
    return new Customer(
      dbCustomer.id,
      dbCustomer.first_name,
      dbCustomer.last_name,
      dbCustomer.email,
      dbCustomer.phone,
      dbCustomer.address,
      dbCustomer.shop_id,
      dbCustomer.created_at,
      dbCustomer.updated_at,
      dbCustomer.city,
      dbCustomer.state,
      dbCustomer.postal_code,
      dbCustomer.country,
      dbCustomer.preferred_technician_id,
      dbCustomer.communication_preference,
      dbCustomer.referral_source,
      dbCustomer.referral_person_id,
      dbCustomer.other_referral_details,
      dbCustomer.household_id,
      dbCustomer.is_fleet,
      dbCustomer.fleet_company,
      dbCustomer.fleet_manager,
      dbCustomer.fleet_contact,
      dbCustomer.preferred_service_type,
      dbCustomer.notes,
      dbCustomer.tags,
      dbCustomer.segments,
      dbCustomer.company,
      dbCustomer.business_type,
      dbCustomer.business_industry,
      dbCustomer.other_business_industry,
      dbCustomer.tax_id,
      dbCustomer.business_email,
      dbCustomer.business_phone,
      dbCustomer.preferred_payment_method,
      dbCustomer.auto_billing,
      dbCustomer.credit_terms,
      dbCustomer.terms_agreed,
      vehicles
    );
  }

  async getAll(): Promise<CustomerEntity[]> {
    console.log('🔄 SupabaseCustomerRepository.getAll: Starting fetch...');
    
    try {
      const { data, error } = await supabase
        .from('customers')
        .select(`
          *,
          vehicles:customer_vehicles(*)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ SupabaseCustomerRepository.getAll error:', error);
        throw error;
      }

      console.log('✅ SupabaseCustomerRepository.getAll: Fetched', data?.length || 0, 'customers');
      
      return (data || []).map(customer => this.convertToCustomerEntity(customer));
    } catch (error) {
      console.error('❌ SupabaseCustomerRepository.getAll: Exception caught:', error);
      throw error;
    }
  }

  async getById(id: string): Promise<CustomerEntity | null> {
    console.log('🔍 SupabaseCustomerRepository.getById: Fetching customer with id:', id);
    
    try {
      const { data, error } = await supabase
        .from('customers')
        .select(`
          *,
          vehicles:customer_vehicles(*)
        `)
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.error('❌ SupabaseCustomerRepository.getById error:', error);
        throw error;
      }

      console.log('✅ SupabaseCustomerRepository.getById: Found customer:', data ? 'Yes' : 'No');
      
      return data ? this.convertToCustomerEntity(data) : null;
    } catch (error) {
      console.error('❌ SupabaseCustomerRepository.getById: Exception caught:', error);
      throw error;
    }
  }

  async search(query: string): Promise<CustomerEntity[]> {
    console.log('🔍 SupabaseCustomerRepository.search: Searching for:', query);
    
    try {
      const { data, error } = await supabase
        .from('customers')
        .select(`
          *,
          vehicles:customer_vehicles(*)
        `)
        .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%,company.ilike.%${query}%`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ SupabaseCustomerRepository.search error:', error);
        throw error;
      }

      console.log('✅ SupabaseCustomerRepository.search: Found', data?.length || 0, 'customers');
      
      return (data || []).map(customer => this.convertToCustomerEntity(customer));
    } catch (error) {
      console.error('❌ SupabaseCustomerRepository.search: Exception caught:', error);
      throw error;
    }
  }

  async filter(filters: CustomerFilters): Promise<CustomerEntity[]> {
    console.log('🔍 SupabaseCustomerRepository.filter: Applying filters:', filters);
    
    try {
      let query = supabase
        .from('customers')
        .select(`
          *,
          vehicles:customer_vehicles(*)
        `);

      // Search filter
      if (filters.search && filters.search.trim()) {
        const searchTerm = filters.search.trim();
        query = query.or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%,company.ilike.%${searchTerm}%`);
      }

      // Has vehicles filter - only apply if it's not empty string
      if (filters.hasVehicles && filters.hasVehicles !== '') {
        // This would require a more complex query with joins or subqueries
        // For now, we'll filter in memory after fetching
      }

      // Date range filter
      if (filters.dateRange?.from) {
        query = query.gte('created_at', filters.dateRange.from.toISOString());
      }
      if (filters.dateRange?.to) {
        query = query.lte('created_at', filters.dateRange.to.toISOString());
      }

      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) {
        console.error('❌ SupabaseCustomerRepository.filter error:', error);
        throw error;
      }

      let result = (data || []).map(customer => this.convertToCustomerEntity(customer));

      // Apply has vehicles filter in memory
      if (filters.hasVehicles && filters.hasVehicles !== '') {
        result = result.filter(customer => {
          const hasVehicles = customer.hasVehicles();
          return filters.hasVehicles === 'yes' ? hasVehicles : !hasVehicles;
        });
      }

      console.log('✅ SupabaseCustomerRepository.filter: Filtered to', result.length, 'customers');
      
      return result;
    } catch (error) {
      console.error('❌ SupabaseCustomerRepository.filter: Exception caught:', error);
      throw error;
    }
  }

  async create(customerData: Omit<CustomerEntity, 'id' | 'created_at' | 'updated_at' | 'fullName' | 'vehicleCount' | 'hasVehicles' | 'isFleetCustomer' | 'matchesSearch'>): Promise<CustomerEntity> {
    console.log('🔄 SupabaseCustomerRepository.create: Creating customer...');
    
    try {
      const { vehicles, ...dbCustomerData } = customerData as any;
      
      const { data, error } = await supabase
        .from('customers')
        .insert(dbCustomerData)
        .select(`
          *,
          vehicles:customer_vehicles(*)
        `)
        .single();

      if (error) {
        console.error('❌ SupabaseCustomerRepository.create error:', error);
        throw error;
      }

      console.log('✅ SupabaseCustomerRepository.create: Created customer:', data.id);
      
      return this.convertToCustomerEntity(data);
    } catch (error) {
      console.error('❌ SupabaseCustomerRepository.create: Exception caught:', error);
      throw error;
    }
  }

  async update(id: string, customerData: Partial<CustomerEntity>): Promise<CustomerEntity> {
    console.log('🔄 SupabaseCustomerRepository.update: Updating customer:', id);
    
    try {
      const { vehicles, fullName, vehicleCount, ...dbCustomerData } = customerData as any;
      
      const { data, error } = await supabase
        .from('customers')
        .update(dbCustomerData)
        .eq('id', id)
        .select(`
          *,
          vehicles:customer_vehicles(*)
        `)
        .single();

      if (error) {
        console.error('❌ SupabaseCustomerRepository.update error:', error);
        throw error;
      }

      console.log('✅ SupabaseCustomerRepository.update: Updated customer:', id);
      
      return this.convertToCustomerEntity(data);
    } catch (error) {
      console.error('❌ SupabaseCustomerRepository.update: Exception caught:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    console.log('🔄 SupabaseCustomerRepository.delete: Deleting customer:', id);
    
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ SupabaseCustomerRepository.delete error:', error);
        throw error;
      }

      console.log('✅ SupabaseCustomerRepository.delete: Deleted customer:', id);
    } catch (error) {
      console.error('❌ SupabaseCustomerRepository.delete: Exception caught:', error);
      throw error;
    }
  }
}
