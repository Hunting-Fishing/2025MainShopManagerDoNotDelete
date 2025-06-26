
import { supabase } from '@/lib/supabase';
import { CustomerEntity, Customer } from '@/domain/customer/entities/Customer';
import { CustomerRepository, CustomerFilters } from '@/domain/customer/repositories/CustomerRepository';
import { CustomerVehicle } from '@/types/customer';

export class SupabaseCustomerRepository implements CustomerRepository {
  async getAll(): Promise<CustomerEntity[]> {
    console.log('🔄 SupabaseCustomerRepository: Fetching all customers...');
    
    try {
      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (customersError) {
        console.error('❌ Error fetching customers:', customersError);
        throw new Error(`Failed to fetch customers: ${customersError.message}`);
      }

      console.log('✅ SupabaseCustomerRepository: Fetched', customersData?.length || 0, 'customers');

      if (!customersData || customersData.length === 0) {
        console.log('📝 SupabaseCustomerRepository: No customers found, returning empty array');
        return [];
      }

      // Fetch vehicles for all customers in batches
      const customerIds = customersData.map(c => c.id);
      
      const { data: vehiclesData, error: vehiclesError } = await supabase
        .from('vehicles')
        .select('*')
        .in('customer_id', customerIds);

      if (vehiclesError) {
        console.warn('⚠️  Warning: Could not fetch vehicles:', vehiclesError.message);
      }

      // Group vehicles by customer_id
      const vehiclesByCustomer = (vehiclesData || []).reduce((acc, vehicle) => {
        if (!acc[vehicle.customer_id]) {
          acc[vehicle.customer_id] = [];
        }
        acc[vehicle.customer_id].push(vehicle as CustomerVehicle);
        return acc;
      }, {} as Record<string, CustomerVehicle[]>);

      // Map to Customer entities
      const customers = customersData.map(customerData => {
        const vehicles = vehiclesByCustomer[customerData.id] || [];
        
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
          customerData.city,
          customerData.state,
          customerData.postal_code,
          customerData.country,
          customerData.preferred_technician_id,
          customerData.communication_preference,
          customerData.referral_source,
          customerData.referral_person_id,
          customerData.other_referral_details,
          customerData.household_id,
          customerData.is_fleet || false,
          customerData.fleet_company,
          customerData.fleet_manager,
          customerData.fleet_contact,
          customerData.preferred_service_type,
          customerData.notes,
          customerData.tags ? JSON.parse(JSON.stringify(customerData.tags)) : [],
          customerData.segments ? JSON.parse(JSON.stringify(customerData.segments)) : [],
          customerData.company,
          customerData.business_type,
          customerData.business_industry,
          customerData.other_business_industry,
          customerData.tax_id,
          customerData.business_email,
          customerData.business_phone,
          customerData.preferred_payment_method,
          customerData.auto_billing,
          customerData.credit_terms,
          customerData.terms_agreed,
          vehicles
        );
      });

      console.log('✅ SupabaseCustomerRepository: Successfully mapped customers to entities');
      return customers;

    } catch (error) {
      console.error('❌ SupabaseCustomerRepository: Unexpected error:', error);
      throw error;
    }
  }

  async getById(id: string): Promise<CustomerEntity | null> {
    console.log('🔄 SupabaseCustomerRepository: Fetching customer by ID:', id);
    
    try {
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .single();

      if (customerError) {
        if (customerError.code === 'PGRST116') {
          console.log('📝 SupabaseCustomerRepository: Customer not found');
          return null;
        }
        console.error('❌ Error fetching customer:', customerError);
        throw new Error(`Failed to fetch customer: ${customerError.message}`);
      }

      // Fetch vehicles for this customer
      const { data: vehiclesData, error: vehiclesError } = await supabase
        .from('vehicles')
        .select('*')
        .eq('customer_id', id);

      if (vehiclesError) {
        console.warn('⚠️  Warning: Could not fetch vehicles:', vehiclesError.message);
      }

      const vehicles = (vehiclesData || []) as CustomerVehicle[];

      const customer = new Customer(
        customerData.id,
        customerData.first_name || '',
        customerData.last_name || '',
        customerData.email || '',
        customerData.phone || '',
        customerData.address || '',
        customerData.shop_id,
        customerData.created_at,
        customerData.updated_at,
        customerData.city,
        customerData.state,
        customerData.postal_code,
        customerData.country,
        customerData.preferred_technician_id,
        customerData.communication_preference,
        customerData.referral_source,
        customerData.referral_person_id,
        customerData.other_referral_details,
        customerData.household_id,
        customerData.is_fleet || false,
        customerData.fleet_company,
        customerData.fleet_manager,
        customerData.fleet_contact,
        customerData.preferred_service_type,
        customerData.notes,
        customerData.tags ? JSON.parse(JSON.stringify(customerData.tags)) : [],
        customerData.segments ? JSON.parse(JSON.stringify(customerData.segments)) : [],
        customerData.company,
        customerData.business_type,
        customerData.business_industry,
        customerData.other_business_industry,
        customerData.tax_id,
        customerData.business_email,
        customerData.business_phone,
        customerData.preferred_payment_method,
        customerData.auto_billing,
        customerData.credit_terms,
        customerData.terms_agreed,
        vehicles
      );

      console.log('✅ SupabaseCustomerRepository: Successfully fetched customer');
      return customer;

    } catch (error) {
      console.error('❌ SupabaseCustomerRepository: Unexpected error:', error);
      throw error;
    }
  }

  async search(query: string): Promise<CustomerEntity[]> {
    // For now, get all customers and filter in memory
    // In production, this should use database search capabilities
    const allCustomers = await this.getAll();
    return allCustomers.filter(customer => customer.matchesSearch(query.toLowerCase()));
  }

  async filter(filters: CustomerFilters): Promise<CustomerEntity[]> {
    const allCustomers = await this.getAll();
    let result = [...allCustomers];

    // Apply search filter
    if (filters.search && filters.search.trim()) {
      const searchTerm = filters.search.trim().toLowerCase();
      result = result.filter(customer => customer.matchesSearch(searchTerm));
    }

    // Apply has vehicles filter
    if (filters.hasVehicles && filters.hasVehicles !== '') {
      result = result.filter(customer => {
        const hasVehicles = customer.hasVehicles();
        return filters.hasVehicles === 'yes' ? hasVehicles : !hasVehicles;
      });
    }

    // Apply date range filter
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

    return result;
  }

  async create(customer: Omit<CustomerEntity, 'id' | 'created_at' | 'updated_at' | 'fullName' | 'vehicleCount' | 'hasVehicles' | 'isFleetCustomer' | 'matchesSearch'>): Promise<CustomerEntity> {
    // Implementation for creating a customer
    throw new Error('Create method not implemented yet');
  }

  async update(id: string, customer: Partial<CustomerEntity>): Promise<CustomerEntity> {
    // Implementation for updating a customer
    throw new Error('Update method not implemented yet');
  }

  async delete(id: string): Promise<void> {
    // Implementation for deleting a customer
    throw new Error('Delete method not implemented yet');
  }
}
