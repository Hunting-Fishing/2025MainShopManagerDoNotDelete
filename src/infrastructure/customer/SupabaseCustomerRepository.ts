
import { supabase } from '@/integrations/supabase/client';
import { CustomerRepository, CustomerFilters } from '@/domain/customer/repositories/CustomerRepository';
import { CustomerEntity, Customer } from '@/domain/customer/entities/Customer';
import { CustomerVehicle } from '@/types/customer';

export class SupabaseCustomerRepository implements CustomerRepository {
  private convertToCustomerEntity(data: any): CustomerEntity {
    // Ensure vehicles is an array
    const vehicles = Array.isArray(data.vehicles) ? data.vehicles : [];
    
    return new Customer(
      data.id,
      data.first_name || '',
      data.last_name || '',
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
      vehicles
    );
  }

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

      console.log('✅ SupabaseCustomerRepository: Fetched', data?.length || 0, 'customers');
      return (data || []).map(customer => this.convertToCustomerEntity(customer));
    } catch (error) {
      console.error('❌ SupabaseCustomerRepository: Exception caught:', error);
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
        console.error('❌ Error fetching customer by id:', error);
        throw error;
      }

      if (!data) {
        console.log('❌ Customer not found with id:', id);
        return null;
      }

      console.log('✅ SupabaseCustomerRepository: Found customer:', data.first_name, data.last_name);
      return this.convertToCustomerEntity(data);
    } catch (error) {
      console.error('❌ SupabaseCustomerRepository: Exception caught:', error);
      throw error;
    }
  }

  async search(query: string): Promise<CustomerEntity[]> {
    console.log('🔍 SupabaseCustomerRepository: Searching customers with query:', query);
    
    try {
      if (!query || query.trim().length === 0) {
        return [];
      }

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
      
      console.log('✅ SupabaseCustomerRepository: Found', data?.length || 0, 'customers');
      return (data || []).map(customer => this.convertToCustomerEntity(customer));
    } catch (error) {
      console.error('❌ SupabaseCustomerRepository: Exception caught:', error);
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

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error filtering customers:', error);
        throw error;
      }

      let result = (data || []).map(customer => this.convertToCustomerEntity(customer));

      // Apply hasVehicles filter (done client-side since it requires joined data)
      if (filters.hasVehicles && filters.hasVehicles !== '') {
        result = result.filter(customer => {
          const hasVehicles = customer.hasVehicles();
          return filters.hasVehicles === 'yes' ? hasVehicles : !hasVehicles;
        });
      }

      console.log('✅ SupabaseCustomerRepository: Filtered to', result.length, 'customers');
      return result;
    } catch (error) {
      console.error('❌ SupabaseCustomerRepository: Exception caught:', error);
      throw error;
    }
  }

  async create(customerData: Omit<CustomerEntity, 'id' | 'created_at' | 'updated_at' | 'fullName' | 'vehicleCount' | 'hasVehicles' | 'isFleetCustomer' | 'matchesSearch'>): Promise<CustomerEntity> {
    console.log('➕ SupabaseCustomerRepository: Creating customer...');
    
    try {
      const { data, error } = await supabase
        .from('customers')
        .insert({
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
          preferred_technician_id: customerData.preferred_technician_id,
          communication_preference: customerData.communication_preference,
          referral_source: customerData.referral_source,
          referral_person_id: customerData.referral_person_id,
          other_referral_details: customerData.other_referral_details,
          household_id: customerData.household_id,
          is_fleet: customerData.is_fleet,
          fleet_company: customerData.fleet_company,
          fleet_manager: customerData.fleet_manager,
          fleet_contact: customerData.fleet_contact,
          preferred_service_type: customerData.preferred_service_type,
          notes: customerData.notes,
          tags: customerData.tags,
          segments: customerData.segments,
          company: customerData.company,
          business_type: customerData.business_type,
          business_industry: customerData.business_industry,
          other_business_industry: customerData.other_business_industry,
          tax_id: customerData.tax_id,
          business_email: customerData.business_email,
          business_phone: customerData.business_phone,
          preferred_payment_method: customerData.preferred_payment_method,
          auto_billing: customerData.auto_billing,
          credit_terms: customerData.credit_terms,
          terms_agreed: customerData.terms_agreed
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating customer:', error);
        throw error;
      }

      console.log('✅ SupabaseCustomerRepository: Created customer:', data.id);
      return this.convertToCustomerEntity({ ...data, vehicles: [] });
    } catch (error) {
      console.error('❌ SupabaseCustomerRepository: Exception caught:', error);
      throw error;
    }
  }

  async update(id: string, customerData: Partial<CustomerEntity>): Promise<CustomerEntity> {
    console.log('✏️ SupabaseCustomerRepository: Updating customer:', id);
    
    try {
      const { data, error } = await supabase
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
          preferred_technician_id: customerData.preferred_technician_id,
          communication_preference: customerData.communication_preference,
          referral_source: customerData.referral_source,
          referral_person_id: customerData.referral_person_id,
          other_referral_details: customerData.other_referral_details,
          household_id: customerData.household_id,
          is_fleet: customerData.is_fleet,
          fleet_company: customerData.fleet_company,
          fleet_manager: customerData.fleet_manager,
          fleet_contact: customerData.fleet_contact,
          preferred_service_type: customerData.preferred_service_type,
          notes: customerData.notes,
          tags: customerData.tags,
          segments: customerData.segments,
          company: customerData.company,
          business_type: customerData.business_type,
          business_industry: customerData.business_industry,
          other_business_industry: customerData.other_business_industry,
          tax_id: customerData.tax_id,
          business_email: customerData.business_email,
          business_phone: customerData.business_phone,
          preferred_payment_method: customerData.preferred_payment_method,
          auto_billing: customerData.auto_billing,
          credit_terms: customerData.credit_terms,
          terms_agreed: customerData.terms_agreed
        })
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

      console.log('✅ SupabaseCustomerRepository: Updated customer:', data.id);
      return this.convertToCustomerEntity(data);
    } catch (error) {
      console.error('❌ SupabaseCustomerRepository: Exception caught:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    console.log('🗑️ SupabaseCustomerRepository: Deleting customer:', id);
    
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Error deleting customer:', error);
        throw error;
      }

      console.log('✅ SupabaseCustomerRepository: Deleted customer:', id);
    } catch (error) {
      console.error('❌ SupabaseCustomerRepository: Exception caught:', error);
      throw error;
    }
  }
}
