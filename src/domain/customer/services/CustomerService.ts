
import { CustomerRepository } from '../repositories/CustomerRepository';
import { CustomerEntity } from '../entities/Customer';

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
    return this.customerRepository.search(query);
  }

  async createCustomer(customerData: Omit<CustomerEntity, 'id' | 'created_at' | 'updated_at' | 'fullName' | 'vehicleCount' | 'hasVehicles' | 'isFleetCustomer' | 'matchesSearch'>): Promise<CustomerEntity> {
    return this.customerRepository.create(customerData);
  }

  async updateCustomer(id: string, customerData: Partial<CustomerEntity>): Promise<CustomerEntity> {
    return this.customerRepository.update(id, customerData);
  }

  async deleteCustomer(id: string): Promise<void> {
    return this.customerRepository.delete(id);
  }

  async calculateStats(customers: CustomerEntity[]): Promise<CustomerStats> {
    const total = customers.length;
    const withVehicles = customers.filter(c => c.hasVehicles()).length;
    const fleetCustomers = customers.filter(c => c.isFleetCustomer()).length;
    
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
}
