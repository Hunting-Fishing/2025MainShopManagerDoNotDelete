
import { useMemo } from 'react';
import { CustomerEntity } from '@/domain/customer/entities/Customer';
import { CustomerService, CustomerStats } from '@/domain/customer/services/CustomerService';
import { SupabaseCustomerRepository } from '@/infrastructure/customer/SupabaseCustomerRepository';

const customerRepository = new SupabaseCustomerRepository();
const customerService = new CustomerService(customerRepository);

export function useCustomerStats(customers: CustomerEntity[]) {
  const stats = useMemo(async () => {
    if (!customers.length) {
      return {
        total: 0,
        withVehicles: 0,
        fleetCustomers: 0,
        recentlyAdded: 0
      };
    }
    
    return await customerService.calculateStats(customers);
  }, [customers]);

  return { stats };
}
