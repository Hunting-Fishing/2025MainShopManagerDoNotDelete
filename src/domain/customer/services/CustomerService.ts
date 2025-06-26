
import { CustomerEntity } from '../entities/Customer';
import { CustomerRepository, CustomerFilters } from '../repositories/CustomerRepository';

export interface CustomerStats {
  total: number;
  withVehicles: number;
  fleetCustomers: number;
  recentlyAdded: number;
}

export class CustomerService {
  constructor(private customerRepository: CustomerRepository) {}

  async getAllCustomers(): Promise<CustomerEntity[]> {
    return this.customerRepository.getAll();
  }

  async getCustomerById(id: string): Promise<CustomerEntity | null> {
    return this.customerRepository.getById(id);
  }

  async searchCustomers(query: string): Promise<CustomerEntity[]> {
    if (!query.trim()) {
      return this.getAllCustomers();
    }
    return this.customerRepository.search(query);
  }

  async filterCustomers(filters: CustomerFilters): Promise<CustomerEntity[]> {
    return this.customerRepository.filter(filters);
  }

  async calculateStats(customers: CustomerEntity[]): Promise<CustomerStats> {
    const total = customers.length;
    const withVehicles = customers.filter(c => c.hasVehicles()).length;
    const fleetCustomers = customers.filter(c => c.isFleetCustomer()).length;
    
    // Calculate recently added (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentlyAdded = customers.filter(c => 
      new Date(c.created_at) >= thirtyDaysAgo
    ).length;

    return {
      total,
      withVehicles,
      fleetCustomers,
      recentlyAdded
    };
  }

  async createCustomer(customerData: Omit<CustomerEntity, 'id' | 'created_at' | 'updated_at' | 'fullName' | 'vehicleCount'>): Promise<CustomerEntity> {
    return this.customerRepository.create(customerData);
  }

  async updateCustomer(id: string, customerData: Partial<CustomerEntity>): Promise<CustomerEntity> {
    return this.customerRepository.update(id, customerData);
  }

  async deleteCustomer(id: string): Promise<void> {
    return this.customerRepository.delete(id);
  }
}
