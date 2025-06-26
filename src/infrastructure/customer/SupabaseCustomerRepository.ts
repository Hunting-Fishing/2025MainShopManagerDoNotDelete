
import { supabase } from '@/integrations/supabase/client';
import { CustomerEntity, Customer } from '@/domain/customer/entities/Customer';
import { CustomerRepository, CustomerFilters } from '@/domain/customer/repositories/CustomerRepository';
import { CustomerVehicle } from '@/types/customer';

export class SupabaseCustomerRepository implements CustomerRepository {
  private mapDatabaseToEntity(dbCustomer: any, vehicles: CustomerVehicle[] = []): CustomerEntity {
    // Map database vehicle data to CustomerVehicle format
    const mappedVehicles = vehicles.map(vehicle => ({
      id: vehicle.id,
      customer_id: vehicle.customer_id,
      year: vehicle.year,
      make: vehicle.make || '',
      model: vehicle.model || '',
      vin: vehicle.vin,
      license_plate: vehicle.license_plate,
      trim: vehicle.trim,
      transmission: vehicle.transmission,
      transmission_type: vehicle.transmission_type,
      drive_type: vehicle.drive_type,
      fuel_type: vehicle.fuel_type,
      engine: vehicle.engine,
      body_style: vehicle.body_style,
      country: vehicle.country,
      gvwr: vehicle.gvwr,
      color: vehicle.color,
      last_service_date: vehicle.last_service_date,
      notes: vehicle.notes,
      created_at: vehicle.created_at,
      updated_at: vehicle.updated_at
    }));

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
      mappedVehicles
    );
  }

  async getAll(): Promise<CustomerEntity[]> {
    console.log('🔄 SupabaseCustomerRepository.getAll: Fetching customers...');
    
    try {
      const { data: customers, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (customerError) {
        console.error('❌ Error fetching customers:', customerError);
        throw customerError;
      }

      if (!customers || customers.length === 0) {
        console.log('✅ No customers found');
        return [];
      }

      // Fetch vehicles for all customers
      const customerIds = customers.map(c => c.id);
      const { data: vehicles, error: vehicleError } = await supabase
        .from('vehicles')
        .select('*')
        .in('customer_id', customerIds);

      if (vehicleError) {
        console.warn('⚠️ Error fetching vehicles:', vehicleError);
      }

      // Group vehicles by customer_id
      const vehiclesByCustomer = (vehicles || []).reduce((acc, vehicle) => {
        if (!acc[vehicle.customer_id]) {
          acc[vehicle.customer_id] = [];
        }
        acc[vehicle.customer_id].push(vehicle);
        return acc;
      }, {} as Record<string, CustomerVehicle[]>);

      // Map customers to entities
      const customerEntities = customers.map(customer => 
        this.mapDatabaseToEntity(customer, vehiclesByCustomer[customer.id] || [])
      );

      console.log('✅ Successfully fetched', customerEntities.length, 'customers');
      return customerEntities;
    } catch (error) {
      console.error('❌ SupabaseCustomerRepository.getAll error:', error);
      throw error;
    }
  }

  async getById(id: string): Promise<CustomerEntity | null> {
    console.log('🔍 SupabaseCustomerRepository.getById:', id);
    
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
        console.log('❌ Customer not found:', id);
        return null;
      }

      // Fetch vehicles for this customer
      const { data: vehicles, error: vehicleError } = await supabase
        .from('vehicles')
        .select('*')
        .eq('customer_id', id);

      if (vehicleError) {
        console.warn('⚠️ Error fetching vehicles:', vehicleError);
      }

      const customerEntity = this.mapDatabaseToEntity(customer, vehicles || []);
      console.log('✅ Successfully fetched customer:', customerEntity.fullName);
      return customerEntity;
    } catch (error) {
      console.error('❌ SupabaseCustomerRepository.getById error:', error);
      throw error;
    }
  }

  async search(query: string): Promise<CustomerEntity[]> {
    console.log('🔍 SupabaseCustomerRepository.search:', query);
    
    if (!query.trim()) {
      return this.getAll();
    }

    try {
      const searchTerm = query.trim().toLowerCase();
      
      const { data: customers, error } = await supabase
        .from('customers')
        .select('*')
        .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%,company.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error searching customers:', error);
        throw error;
      }

      if (!customers || customers.length === 0) {
        console.log('✅ No customers found for search:', query);
        return [];
      }

      // Fetch vehicles for found customers
      const customerIds = customers.map(c => c.id);
      const { data: vehicles, error: vehicleError } = await supabase
        .from('vehicles')
        .select('*')
        .in('customer_id', customerIds);

      if (vehicleError) {
        console.warn('⚠️ Error fetching vehicles:', vehicleError);
      }

      // Group vehicles by customer_id
      const vehiclesByCustomer = (vehicles || []).reduce((acc, vehicle) => {
        if (!acc[vehicle.customer_id]) {
          acc[vehicle.customer_id] = [];
        }
        acc[vehicle.customer_id].push(vehicle);
        return acc;
      }, {} as Record<string, CustomerVehicle[]>);

      const customerEntities = customers.map(customer => 
        this.mapDatabaseToEntity(customer, vehiclesByCustomer[customer.id] || [])
      );

      console.log('✅ Search found', customerEntities.length, 'customers');
      return customerEntities;
    } catch (error) {
      console.error('❌ SupabaseCustomerRepository.search error:', error);
      throw error;
    }
  }

  async filter(filters: CustomerFilters): Promise<CustomerEntity[]> {
    console.log('🔍 SupabaseCustomerRepository.filter:', filters);
    
    try {
      let query = supabase
        .from('customers')
        .select('*');

      // Apply search filter
      if (filters.search && filters.search.trim()) {
        const searchTerm = filters.search.trim().toLowerCase();
        query = query.or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%,company.ilike.%${searchTerm}%`);
      }

      // Apply date range filter
      if (filters.dateRange?.from) {
        query = query.gte('created_at', filters.dateRange.from.toISOString());
      }
      if (filters.dateRange?.to) {
        query = query.lte('created_at', filters.dateRange.to.toISOString());
      }

      query = query.order('created_at', { ascending: false });

      const { data: customers, error } = await query;

      if (error) {
        console.error('❌ Error filtering customers:', error);
        throw error;
      }

      if (!customers || customers.length === 0) {
        console.log('✅ No customers found for filters');
        return [];
      }

      // Fetch vehicles for filtered customers
      const customerIds = customers.map(c => c.id);
      const { data: vehicles, error: vehicleError } = await supabase
        .from('vehicles')
        .select('*')
        .in('customer_id', customerIds);

      if (vehicleError) {
        console.warn('⚠️ Error fetching vehicles:', vehicleError);
      }

      // Group vehicles by customer_id
      const vehiclesByCustomer = (vehicles || []).reduce((acc, vehicle) => {
        if (!acc[vehicle.customer_id]) {
          acc[vehicle.customer_id] = [];
        }
        acc[vehicle.customer_id].push(vehicle);
        return acc;
      }, {} as Record<string, CustomerVehicle[]>);

      let customerEntities = customers.map(customer => 
        this.mapDatabaseToEntity(customer, vehiclesByCustomer[customer.id] || [])
      );

      // Apply hasVehicles filter (client-side since it depends on the relationship)
      if (filters.hasVehicles && filters.hasVehicles !== '') {
        customerEntities = customerEntities.filter(customer => {
          const hasVehicles = customer.hasVehicles();
          return filters.hasVehicles === 'yes' ? hasVehicles : !hasVehicles;
        });
      }

      console.log('✅ Filter found', customerEntities.length, 'customers');
      return customerEntities;
    } catch (error) {
      console.error('❌ SupabaseCustomerRepository.filter error:', error);
      throw error;
    }
  }

  async create(customerData: Omit<CustomerEntity, 'id' | 'created_at' | 'updated_at' | 'fullName' | 'vehicleCount' | 'hasVehicles' | 'isFleetCustomer' | 'matchesSearch'>): Promise<CustomerEntity> {
    console.log('➕ SupabaseCustomerRepository.create');
    
    try {
      const { data: customer, error } = await supabase
        .from('customers')
        .insert([{
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
        }])
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating customer:', error);
        throw error;
      }

      const customerEntity = this.mapDatabaseToEntity(customer);
      console.log('✅ Successfully created customer:', customerEntity.fullName);
      return customerEntity;
    } catch (error) {
      console.error('❌ SupabaseCustomerRepository.create error:', error);
      throw error;
    }
  }

  async update(id: string, customerData: Partial<CustomerEntity>): Promise<CustomerEntity> {
    console.log('✏️ SupabaseCustomerRepository.update:', id);
    
    try {
      const updateData: any = {};
      
      // Only include fields that are part of the database schema
      if (customerData.first_name !== undefined) updateData.first_name = customerData.first_name;
      if (customerData.last_name !== undefined) updateData.last_name = customerData.last_name;
      if (customerData.email !== undefined) updateData.email = customerData.email;
      if (customerData.phone !== undefined) updateData.phone = customerData.phone;
      if (customerData.address !== undefined) updateData.address = customerData.address;
      if (customerData.city !== undefined) updateData.city = customerData.city;
      if (customerData.state !== undefined) updateData.state = customerData.state;
      if (customerData.postal_code !== undefined) updateData.postal_code = customerData.postal_code;
      if (customerData.country !== undefined) updateData.country = customerData.country;
      if (customerData.preferred_technician_id !== undefined) updateData.preferred_technician_id = customerData.preferred_technician_id;
      if (customerData.communication_preference !== undefined) updateData.communication_preference = customerData.communication_preference;
      if (customerData.referral_source !== undefined) updateData.referral_source = customerData.referral_source;
      if (customerData.referral_person_id !== undefined) updateData.referral_person_id = customerData.referral_person_id;
      if (customerData.other_referral_details !== undefined) updateData.other_referral_details = customerData.other_referral_details;
      if (customerData.household_id !== undefined) updateData.household_id = customerData.household_id;
      if (customerData.is_fleet !== undefined) updateData.is_fleet = customerData.is_fleet;
      if (customerData.fleet_company !== undefined) updateData.fleet_company = customerData.fleet_company;
      if (customerData.fleet_manager !== undefined) updateData.fleet_manager = customerData.fleet_manager;
      if (customerData.fleet_contact !== undefined) updateData.fleet_contact = customerData.fleet_contact;
      if (customerData.preferred_service_type !== undefined) updateData.preferred_service_type = customerData.preferred_service_type;
      if (customerData.notes !== undefined) updateData.notes = customerData.notes;
      if (customerData.tags !== undefined) updateData.tags = customerData.tags;
      if (customerData.segments !== undefined) updateData.segments = customerData.segments;
      if (customerData.company !== undefined) updateData.company = customerData.company;
      if (customerData.business_type !== undefined) updateData.business_type = customerData.business_type;
      if (customerData.business_industry !== undefined) updateData.business_industry = customerData.business_industry;
      if (customerData.other_business_industry !== undefined) updateData.other_business_industry = customerData.other_business_industry;
      if (customerData.tax_id !== undefined) updateData.tax_id = customerData.tax_id;
      if (customerData.business_email !== undefined) updateData.business_email = customerData.business_email;
      if (customerData.business_phone !== undefined) updateData.business_phone = customerData.business_phone;
      if (customerData.preferred_payment_method !== undefined) updateData.preferred_payment_method = customerData.preferred_payment_method;
      if (customerData.auto_billing !== undefined) updateData.auto_billing = customerData.auto_billing;
      if (customerData.credit_terms !== undefined) updateData.credit_terms = customerData.credit_terms;
      if (customerData.terms_agreed !== undefined) updateData.terms_agreed = customerData.terms_agreed;

      const { data: customer, error } = await supabase
        .from('customers')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating customer:', error);
        throw error;
      }

      // Fetch vehicles for the updated customer
      const { data: vehicles, error: vehicleError } = await supabase
        .from('vehicles')
        .select('*')
        .eq('customer_id', id);

      if (vehicleError) {
        console.warn('⚠️ Error fetching vehicles:', vehicleError);
      }

      const customerEntity = this.mapDatabaseToEntity(customer, vehicles || []);
      console.log('✅ Successfully updated customer:', customerEntity.fullName);
      return customerEntity;
    } catch (error) {
      console.error('❌ SupabaseCustomerRepository.update error:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    console.log('🗑️ SupabaseCustomerRepository.delete:', id);
    
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Error deleting customer:', error);
        throw error;
      }

      console.log('✅ Successfully deleted customer:', id);
    } catch (error) {
      console.error('❌ SupabaseCustomerRepository.delete error:', error);
      throw error;
    }
  }
}
