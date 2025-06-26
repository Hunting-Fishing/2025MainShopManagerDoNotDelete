
import { supabase } from '@/integrations/supabase/client';
import { CustomerRepository, CustomerFilters } from '@/domain/customer/repositories/CustomerRepository';
import { CustomerEntity, Customer } from '@/domain/customer/entities/Customer';
import { CustomerVehicle } from '@/types/customer';

export class SupabaseCustomerRepository implements CustomerRepository {
  private mapDatabaseRowToCustomerEntity(row: any, vehicles: CustomerVehicle[] = []): CustomerEntity {
    return new Customer(
      row.id,
      row.first_name,
      row.last_name,
      row.email,
      row.phone,
      row.address,
      row.shop_id,
      row.created_at,
      row.updated_at,
      row.city,
      row.state,
      row.postal_code,
      row.country,
      row.preferred_technician_id,
      row.communication_preference,
      row.referral_source,
      row.referral_person_id,
      row.other_referral_details,
      row.household_id,
      row.is_fleet,
      row.fleet_company,
      row.fleet_manager,
      row.fleet_contact,
      row.preferred_service_type,
      row.notes,
      row.tags ? JSON.parse(JSON.stringify(row.tags)) : [],
      row.segments ? JSON.parse(JSON.stringify(row.segments)) : [],
      row.company,
      row.business_type,
      row.business_industry,
      row.other_business_industry,
      row.tax_id,
      row.business_email,
      row.business_phone,
      row.preferred_payment_method,
      row.auto_billing,
      row.credit_terms,
      row.terms_agreed,
      vehicles
    );
  }

  private async getVehiclesForCustomers(customerIds: string[]): Promise<Map<string, CustomerVehicle[]>> {
    if (customerIds.length === 0) return new Map();

    const { data: vehicles, error } = await supabase
      .from('vehicles')
      .select('*')
      .in('customer_id', customerIds);

    if (error) {
      console.error('Error fetching vehicles:', error);
      return new Map();
    }

    const vehicleMap = new Map<string, CustomerVehicle[]>();
    
    vehicles?.forEach(vehicle => {
      const customerId = vehicle.customer_id;
      if (!vehicleMap.has(customerId)) {
        vehicleMap.set(customerId, []);
      }
      vehicleMap.get(customerId)!.push({
        id: vehicle.id,
        customer_id: vehicle.customer_id,
        year: vehicle.year,
        make: vehicle.make,
        model: vehicle.model,
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
      });
    });

    return vehicleMap;
  }

  async getAll(): Promise<CustomerEntity[]> {
    const { data: customers, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching customers:', error);
      throw new Error(`Failed to fetch customers: ${error.message}`);
    }

    if (!customers || customers.length === 0) {
      return [];
    }

    // Get vehicles for all customers
    const customerIds = customers.map(c => c.id);
    const vehicleMap = await this.getVehiclesForCustomers(customerIds);

    return customers.map(customer => {
      const vehicles = vehicleMap.get(customer.id) || [];
      return this.mapDatabaseRowToCustomerEntity(customer, vehicles);
    });
  }

  async getById(id: string): Promise<CustomerEntity | null> {
    const { data: customer, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching customer:', error);
      throw new Error(`Failed to fetch customer: ${error.message}`);
    }

    if (!customer) {
      return null;
    }

    // Get vehicles for this customer
    const vehicleMap = await this.getVehiclesForCustomers([customer.id]);
    const vehicles = vehicleMap.get(customer.id) || [];

    return this.mapDatabaseRowToCustomerEntity(customer, vehicles);
  }

  async search(query: string): Promise<CustomerEntity[]> {
    const searchTerm = query.toLowerCase();
    
    const { data: customers, error } = await supabase
      .from('customers')
      .select('*')
      .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%,company.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error searching customers:', error);
      throw new Error(`Failed to search customers: ${error.message}`);
    }

    if (!customers || customers.length === 0) {
      return [];
    }

    // Get vehicles for found customers
    const customerIds = customers.map(c => c.id);
    const vehicleMap = await this.getVehiclesForCustomers(customerIds);

    return customers.map(customer => {
      const vehicles = vehicleMap.get(customer.id) || [];
      return this.mapDatabaseRowToCustomerEntity(customer, vehicles);
    });
  }

  async filter(filters: CustomerFilters): Promise<CustomerEntity[]> {
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

    const { data: customers, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error filtering customers:', error);
      throw new Error(`Failed to filter customers: ${error.message}`);
    }

    if (!customers || customers.length === 0) {
      return [];
    }

    // Get vehicles for all customers
    const customerIds = customers.map(c => c.id);
    const vehicleMap = await this.getVehiclesForCustomers(customerIds);

    let results = customers.map(customer => {
      const vehicles = vehicleMap.get(customer.id) || [];
      return this.mapDatabaseRowToCustomerEntity(customer, vehicles);
    });

    // Apply has vehicles filter (done in memory since it depends on vehicle relationships)
    if (filters.hasVehicles && filters.hasVehicles !== '') {
      results = results.filter(customer => {
        const hasVehicles = customer.hasVehicles();
        return filters.hasVehicles === 'yes' ? hasVehicles : !hasVehicles;
      });
    }

    return results;
  }

  async create(customerData: Omit<CustomerEntity, 'id' | 'created_at' | 'updated_at' | 'fullName' | 'vehicleCount' | 'hasVehicles' | 'isFleetCustomer' | 'matchesSearch'>): Promise<CustomerEntity> {
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
      console.error('Error creating customer:', error);
      throw new Error(`Failed to create customer: ${error.message}`);
    }

    return this.mapDatabaseRowToCustomerEntity(customer, []);
  }

  async update(id: string, customerData: Partial<CustomerEntity>): Promise<CustomerEntity> {
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
      console.error('Error updating customer:', error);
      throw new Error(`Failed to update customer: ${error.message}`);
    }

    // Get vehicles for updated customer
    const vehicleMap = await this.getVehiclesForCustomers([customer.id]);
    const vehicles = vehicleMap.get(customer.id) || [];

    return this.mapDatabaseRowToCustomerEntity(customer, vehicles);
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting customer:', error);
      throw new Error(`Failed to delete customer: ${error.message}`);
    }
  }
}
