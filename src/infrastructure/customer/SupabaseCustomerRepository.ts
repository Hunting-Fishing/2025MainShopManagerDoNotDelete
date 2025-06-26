
import { supabase } from '@/integrations/supabase/client';
import { CustomerEntity, Customer } from '@/domain/customer/entities/Customer';
import { CustomerRepository, CustomerFilters } from '@/domain/customer/repositories/CustomerRepository';
import { CustomerVehicle } from '@/types/customer';

export class SupabaseCustomerRepository implements CustomerRepository {
  private async transformToCustomerEntity(dbCustomer: any, vehicles: CustomerVehicle[] = []): Promise<CustomerEntity> {
    return new Customer(
      dbCustomer.id,
      dbCustomer.first_name || '',
      dbCustomer.last_name || '',
      dbCustomer.email || '',
      dbCustomer.phone || '',
      dbCustomer.address || '',
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
      dbCustomer.is_fleet || false,
      dbCustomer.fleet_company,
      dbCustomer.fleet_manager,
      dbCustomer.fleet_contact,
      dbCustomer.preferred_service_type,
      dbCustomer.notes,
      Array.isArray(dbCustomer.tags) ? dbCustomer.tags : [],
      Array.isArray(dbCustomer.segments) ? dbCustomer.segments : [],
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
    console.log('🔄 SupabaseCustomerRepository: Fetching all customers...');
    
    try {
      // Get customers
      const { data: customers, error: customersError } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (customersError) {
        console.error('❌ Error fetching customers:', customersError);
        throw customersError;
      }

      if (!customers) {
        console.log('📭 No customers found');
        return [];
      }

      console.log('✅ Found', customers.length, 'customers');

      // Get vehicles for all customers
      const customerIds = customers.map(c => c.id);
      const { data: vehicles, error: vehiclesError } = await supabase
        .from('vehicles')
        .select('*')
        .in('customer_id', customerIds);

      if (vehiclesError) {
        console.warn('⚠️ Error fetching vehicles:', vehiclesError);
      }

      // Group vehicles by customer_id
      const vehiclesByCustomer = new Map<string, CustomerVehicle[]>();
      if (vehicles) {
        vehicles.forEach(vehicle => {
          const customerId = vehicle.customer_id;
          if (!vehiclesByCustomer.has(customerId)) {
            vehiclesByCustomer.set(customerId, []);
          }
          vehiclesByCustomer.get(customerId)?.push({
            id: vehicle.id,
            customer_id: vehicle.customer_id,
            year: vehicle.year,
            make: vehicle.make,
            model: vehicle.model,
            vin: vehicle.vin,
            license_plate: vehicle.license_plate,
            trim: vehicle.trim,
            created_at: vehicle.created_at,
            updated_at: vehicle.updated_at
          });
        });
      }

      // Transform customers with their vehicles
      const customerEntities = await Promise.all(
        customers.map(customer => {
          const customerVehicles = vehiclesByCustomer.get(customer.id) || [];
          return this.transformToCustomerEntity(customer, customerVehicles);
        })
      );

      console.log('✅ Transformed', customerEntities.length, 'customer entities');
      return customerEntities;

    } catch (error) {
      console.error('❌ SupabaseCustomerRepository.getAll failed:', error);
      throw error;
    }
  }

  async getById(id: string): Promise<CustomerEntity | null> {
    console.log('🔄 SupabaseCustomerRepository: Fetching customer by ID:', id);
    
    try {
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (customerError) {
        console.error('❌ Error fetching customer:', customerError);
        throw customerError;
      }

      if (!customer) {
        console.log('📭 Customer not found');
        return null;
      }

      // Get vehicles for this customer
      const { data: vehicles, error: vehiclesError } = await supabase
        .from('vehicles')
        .select('*')
        .eq('customer_id', id);

      if (vehiclesError) {
        console.warn('⚠️ Error fetching vehicles:', vehiclesError);
      }

      const customerVehicles: CustomerVehicle[] = vehicles?.map(vehicle => ({
        id: vehicle.id,
        customer_id: vehicle.customer_id,
        year: vehicle.year,
        make: vehicle.make,
        model: vehicle.model,
        vin: vehicle.vin,
        license_plate: vehicle.license_plate,
        trim: vehicle.trim,
        created_at: vehicle.created_at,
        updated_at: vehicle.updated_at
      })) || [];

      const customerEntity = await this.transformToCustomerEntity(customer, customerVehicles);
      console.log('✅ Found customer:', customerEntity.fullName);
      return customerEntity;

    } catch (error) {
      console.error('❌ SupabaseCustomerRepository.getById failed:', error);
      throw error;
    }
  }

  async search(query: string): Promise<CustomerEntity[]> {
    console.log('🔄 SupabaseCustomerRepository: Searching customers with query:', query);
    
    try {
      const { data: customers, error } = await supabase
        .from('customers')
        .select('*')
        .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%,company.ilike.%${query}%`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error searching customers:', error);
        throw error;
      }

      if (!customers) {
        return [];
      }

      // Get vehicles for found customers
      const customerIds = customers.map(c => c.id);
      const { data: vehicles } = await supabase
        .from('vehicles')
        .select('*')
        .in('customer_id', customerIds);

      // Group vehicles by customer_id
      const vehiclesByCustomer = new Map<string, CustomerVehicle[]>();
      if (vehicles) {
        vehicles.forEach(vehicle => {
          const customerId = vehicle.customer_id;
          if (!vehiclesByCustomer.has(customerId)) {
            vehiclesByCustomer.set(customerId, []);
          }
          vehiclesByCustomer.get(customerId)?.push({
            id: vehicle.id,
            customer_id: vehicle.customer_id,
            year: vehicle.year,
            make: vehicle.make,
            model: vehicle.model,
            vin: vehicle.vin,
            license_plate: vehicle.license_plate,
            trim: vehicle.trim,
            created_at: vehicle.created_at,
            updated_at: vehicle.updated_at
          });
        });
      }

      const customerEntities = await Promise.all(
        customers.map(customer => {
          const customerVehicles = vehiclesByCustomer.get(customer.id) || [];
          return this.transformToCustomerEntity(customer, customerVehicles);
        })
      );

      console.log('✅ Found', customerEntities.length, 'customers matching search');
      return customerEntities;

    } catch (error) {
      console.error('❌ SupabaseCustomerRepository.search failed:', error);
      throw error;
    }
  }

  async filter(filters: CustomerFilters): Promise<CustomerEntity[]> {
    console.log('🔄 SupabaseCustomerRepository: Filtering customers with filters:', filters);
    
    // For now, get all customers and filter in memory
    // This is simpler and avoids complex SQL queries
    const allCustomers = await this.getAll();
    
    let result = [...allCustomers];

    // Search filter
    if (filters.search && filters.search.trim()) {
      const searchTerm = filters.search.trim().toLowerCase();
      result = result.filter(customer => customer.matchesSearch(searchTerm));
    }

    // Has vehicles filter
    if (filters.hasVehicles && filters.hasVehicles !== '') {
      result = result.filter(customer => {
        const hasVehicles = customer.hasVehicles();
        return filters.hasVehicles === 'yes' ? hasVehicles : !hasVehicles;
      });
    }

    // Date range filter
    if (filters.dateRange?.from || filters.dateRange?.to) {
      result = result.filter(customer => {
        const customerDate = new Date(customer.created_at);
        
        if (filters.dateRange?.from && customerDate < filters.dateRange.from) {
          return false;
        }
        
        if (filters.dateRange?.to && customerDate > filters.dateRange.to) {
          return false;
        }
        
        return true;
      });
    }

    console.log('✅ Filtered to', result.length, 'customers');
    return result;
  }

  async create(customerData: Omit<CustomerEntity, 'id' | 'created_at' | 'updated_at' | 'fullName' | 'vehicleCount' | 'hasVehicles' | 'isFleetCustomer' | 'matchesSearch'>): Promise<CustomerEntity> {
    console.log('🔄 SupabaseCustomerRepository: Creating customer');
    
    try {
      const { data: customer, error } = await supabase
        .from('customers')
        .insert({
          first_name: customerData.first_name,
          last_name: customerData.last_name,
          email: customerData.email,
          phone: customerData.phone,
          address: customerData.address,
          shop_id: customerData.shop_id,
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
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating customer:', error);
        throw error;
      }

      const customerEntity = await this.transformToCustomerEntity(customer, customerData.vehicles || []);
      console.log('✅ Created customer:', customerEntity.fullName);
      return customerEntity;

    } catch (error) {
      console.error('❌ SupabaseCustomerRepository.create failed:', error);
      throw error;
    }
  }

  async update(id: string, customerData: Partial<CustomerEntity>): Promise<CustomerEntity> {
    console.log('🔄 SupabaseCustomerRepository: Updating customer:', id);
    
    try {
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
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating customer:', error);
        throw error;
      }

      // Get updated customer with vehicles
      const updatedCustomer = await this.getById(id);
      if (!updatedCustomer) {
        throw new Error('Failed to retrieve updated customer');
      }

      console.log('✅ Updated customer:', updatedCustomer.fullName);
      return updatedCustomer;

    } catch (error) {
      console.error('❌ SupabaseCustomerRepository.update failed:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    console.log('🔄 SupabaseCustomerRepository: Deleting customer:', id);
    
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Error deleting customer:', error);
        throw error;
      }

      console.log('✅ Deleted customer:', id);

    } catch (error) {
      console.error('❌ SupabaseCustomerRepository.delete failed:', error);
      throw error;
    }
  }
}
