
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CustomerEntity } from '@/domain/customer/entities/Customer';
import { CustomerService } from '@/domain/customer/services/CustomerService';
import { SupabaseCustomerRepository } from '@/infrastructure/customer/SupabaseCustomerRepository';

const customerRepository = new SupabaseCustomerRepository();
const customerService = new CustomerService(customerRepository);

export function useCustomerData() {
  console.log('🔄 useCustomerData: Hook initialized');
  
  const {
    data: customers = [],
    isLoading: loading,
    error,
    refetch
  } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      console.log('🔄 useCustomerData: Fetching customers...');
      const result = await customerService.getAllCustomers();
      console.log('✅ useCustomerData: Successfully fetched', result?.length || 0, 'customers');
      return result || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    customers,
    loading,
    error: error?.message || null,
    refetch,
  };
}
