import { supabase } from '@/integrations/supabase/client';
import { Customer } from '@/domain/customer/entities/Customer';
import { CustomerRepository, CustomerFilters } from '@/domain/customer/repositories/CustomerRepository';

export class SupabaseCustomerRepository implements CustomerRepository {
  async getAll(): Promise<Customer[]> {
    console.log('🔄 SupabaseCustomerRepository: Fetching all customers...');
    
    try {
      const { data, error } = await supabase
        .from('customers')
        .select(`
          *,
          vehicles:vehicles(*)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ SupabaseCustomerRepository error:', error);
        throw error;
      }

      console.log('✅ SupabaseCustomerRepository: Fetched', data?.length || 0, 'customers');
      
      return data?.map(customerData => {
        console.log('🔄 Creating Customer entity for:', customerData.id);
        return new Customer(
          customerData.id,
          customerData.first_name || '',
          customerData.last_name || '',
          customerData.email || '',
          customerData.phone || '',
          customerData.address || '',
          customerData.shop_id,
          customerData.created_at,
          customerData.updated_at,
          {
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
            business_type: customerData.business_type,
            business_industry: customerData.business_industry,
            other_business_industry: customerData.other_business_industry,
            tax_id: customerData.tax_id,
            business_email: customerData.business_email,
            business_phone: customerData.business_phone,
            preferred_payment_method: customerData.preferred_payment_method,
            auto_billing: customerData.auto_billing,
            credit_terms: customerData.credit_terms,
            terms_agreed: customerData.terms_agreed,
            vehicles: customerData.vehicles || []
          }
        );
      }) || [];
    } catch (error) {
      console.error('❌ SupabaseCustomerRepository: Exception:', error);
      throw error;
    }
  }

  async getById(id: string): Promise<Customer | null> {
    console.log('🔍 SupabaseCustomerRepository: Fetching customer by id:', id);
    
    try {
      const { data, error } = await supabase
        .from('customers')
        .select(`
          *,
          vehicles:vehicles(*)
        `)
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.error('❌ SupabaseCustomerRepository getById error:', error);
        throw error;
      }

      if (!data) {
        console.log('⚠️ SupabaseCustomerRepository: Customer not found');
        return null;
      }

      console.log('✅ SupabaseCustomerRepository: Found customer');
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
        {
          city: data.city,
          state: data.state,
          postal_code: data.postal_code,
          country: data.country,
          preferred_technician_id: data.preferred_technician_id,
          communication_preference: data.communication_preference,
          referral_source: data.referral_source,
          referral_person_id: data.referral_person_id,
          other_referral_details: data.other_referral_details,
          household_id: data.household_id,
          is_fleet: data.is_fleet,
          fleet_company: data.fleet_company,
          fleet_manager: data.fleet_manager,
          fleet_contact: data.fleet_contact,
          preferred_service_type: data.preferred_service_type,
          notes: data.notes,
          tags: data.tags,
          segments: data.segments,
          business_type: data.business_type,
          business_industry: data.business_industry,
          other_business_industry: data.other_business_industry,
          tax_id: data.tax_id,
          business_email: data.business_email,
          business_phone: data.business_phone,
          preferred_payment_method: data.preferred_payment_method,
          auto_billing: data.auto_billing,
          credit_terms: data.credit_terms,
          terms_agreed: data.terms_agreed,
          vehicles: data.vehicles || []
        }
      );
    } catch (error) {
      console.error('❌ SupabaseCustomerRepository getById: Exception:', error);
      throw error;
    }
  }

  async search(query: string): Promise<Customer[]> {
    console.log('🔍 SupabaseCustomerRepository: Searching customers with query:', query);
    
    try {
      const { data, error } = await supabase
        .from('customers')
        .select(`
          *,
          vehicles:vehicles(*)
        `)
        .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ SupabaseCustomerRepository search error:', error);
        throw error;
      }

      console.log('✅ SupabaseCustomerRepository: Found', data?.length || 0, 'customers');
      
      return data?.map(customerData => new Customer(
        customerData.id,
        customerData.first_name || '',
        customerData.last_name || '',
        customerData.email || '',
        customerData.phone || '',
        customerData.address || '',
        customerData.shop_id,
        customerData.created_at,
        customerData.updated_at,
        {
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
          business_type: customerData.business_type,
          business_industry: customerData.business_industry,
          other_business_industry: customerData.other_business_industry,
          tax_id: customerData.tax_id,
          business_email: customerData.business_email,
          business_phone: customerData.business_phone,
          preferred_payment_method: customerData.preferred_payment_method,
          auto_billing: customerData.auto_billing,
          credit_terms: customerData.credit_terms,
          terms_agreed: customerData.terms_agreed,
          vehicles: customerData.vehicles || []
        }
      )) || [];
    } catch (error) {
      console.error('❌ SupabaseCustomerRepository search: Exception:', error);
      throw error;
    }
  }

  async filter(filters: CustomerFilters): Promise<Customer[]> {
    console.log('🔍 SupabaseCustomerRepository: Filtering customers with filters:', filters);
    
    try {
      let query = supabase
        .from('customers')
        .select(`
          *,
          vehicles:vehicles(*)
        `);

      // Apply search filter
      if (filters.search && filters.search.trim()) {
        const searchTerm = filters.search.trim();
        query = query.or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`);
      }

      // Apply has vehicles filter
      if (filters.hasVehicles && filters.hasVehicles !== '') {
        if (filters.hasVehicles === 'yes') {
          query = query.not('vehicles', 'is', null);
        } else if (filters.hasVehicles === 'no') {
          query = query.is('vehicles', null);
        }
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('❌ SupabaseCustomerRepository filter error:', error);
        throw error;
      }

      console.log('✅ SupabaseCustomerRepository: Filtered', data?.length || 0, 'customers');
      
      return data?.map(customerData => new Customer(
        customerData.id,
        customerData.first_name || '',
        customerData.last_name || '',
        customerData.email || '',
        customerData.phone || '',
        customerData.address || '',
        customerData.shop_id,
        customerData.created_at,
        customerData.updated_at,
        {
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
          business_type: customerData.business_type,
          business_industry: customerData.business_industry,
          other_business_industry: customerData.other_business_industry,
          tax_id: customerData.tax_id,
          business_email: customerData.business_email,
          business_phone: customerData.business_phone,
          preferred_payment_method: customerData.preferred_payment_method,
          auto_billing: customerData.auto_billing,
          credit_terms: customerData.credit_terms,
          terms_agreed: customerData.terms_agreed,
          vehicles: customerData.vehicles || []
        }
      )) || [];
    } catch (error) {
      console.error('❌ SupabaseCustomerRepository filter: Exception:', error);
      throw error;
    }
  }

  async create(customerData: Omit<Customer, 'id' | 'created_at' | 'updated_at' | 'fullName' | 'vehicleCount' | 'hasVehicles' | 'isFleetCustomer' | 'matchesSearch'>): Promise<Customer> {
    try {
      const { data, error } = await supabase
        .from('customers')
        .insert([
          {
            ...customerData,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error('❌ SupabaseCustomerRepository create error:', error);
        throw error;
      }

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
        {
          city: data.city,
          state: data.state,
          postal_code: data.postal_code,
          country: data.country,
          preferred_technician_id: data.preferred_technician_id,
          communication_preference: data.communication_preference,
          referral_source: data.referral_source,
          referral_person_id: data.referral_person_id,
          other_referral_details: data.other_referral_details,
          household_id: data.household_id,
          is_fleet: data.is_fleet,
          fleet_company: data.fleet_company,
          fleet_manager: data.fleet_manager,
          fleet_contact: data.fleet_contact,
          preferred_service_type: data.preferred_service_type,
          notes: data.notes,
          tags: data.tags,
          segments: data.segments,
          business_type: data.business_type,
          business_industry: data.business_industry,
          other_business_industry: data.other_business_industry,
          tax_id: data.tax_id,
          business_email: data.business_email,
          business_phone: data.business_phone,
          preferred_payment_method: data.preferred_payment_method,
          auto_billing: data.auto_billing,
          credit_terms: data.credit_terms,
          terms_agreed: data.terms_agreed,
          vehicles: []
        }
      );
    } catch (error) {
      console.error('❌ SupabaseCustomerRepository create: Exception:', error);
      throw error;
    }
  }

  async update(id: string, updates: Partial<Customer>): Promise<Customer> {
    try {
      const { data, error } = await supabase
        .from('customers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ SupabaseCustomerRepository update error:', error);
        throw error;
      }

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
        {
          city: data.city,
          state: data.state,
          postal_code: data.postal_code,
          country: data.country,
          preferred_technician_id: data.preferred_technician_id,
          communication_preference: data.communication_preference,
          referral_source: data.referral_source,
          referral_person_id: data.referral_person_id,
          other_referral_details: data.other_referral_details,
          household_id: data.household_id,
          is_fleet: data.is_fleet,
          fleet_company: data.fleet_company,
          fleet_manager: data.fleet_manager,
          fleet_contact: data.fleet_contact,
          preferred_service_type: data.preferred_service_type,
          notes: data.notes,
          tags: data.tags,
          segments: data.segments,
          business_type: data.business_type,
          business_industry: data.business_industry,
          other_business_industry: data.other_business_industry,
          tax_id: data.tax_id,
          business_email: data.business_email,
          business_phone: data.business_phone,
          preferred_payment_method: data.preferred_payment_method,
          auto_billing: data.auto_billing,
          credit_terms: data.credit_terms,
          terms_agreed: data.terms_agreed,
          vehicles: []
        }
      );
    } catch (error) {
      console.error('❌ SupabaseCustomerRepository update: Exception:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ SupabaseCustomerRepository delete error:', error);
        throw error;
      }
    } catch (error) {
      console.error('❌ SupabaseCustomerRepository delete: Exception:', error);
      throw error;
    }
  }
}
