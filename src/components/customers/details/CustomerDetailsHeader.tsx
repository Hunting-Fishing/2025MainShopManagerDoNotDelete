
import React from 'react';
import { CustomerHeader } from '../CustomerHeader';
import { CustomerInfoCard } from '../CustomerInfoCard';
import { CustomerLoyaltyCard } from '../loyalty/CustomerLoyaltyCard';
import { useCustomerLoyalty } from '@/hooks/useCustomerLoyalty';
import { Customer } from '@/types/customer';

interface CustomerDetailsHeaderProps {
  customer: Customer;
  setAddInteractionOpen: (open: boolean) => void;
}

export function CustomerDetailsHeader({ customer, setAddInteractionOpen }: CustomerDetailsHeaderProps) {
  const { customerLoyalty, loading: loyaltyLoading } = useCustomerLoyalty(customer.id);

  return (
    <div className="space-y-6">
      <CustomerHeader 
        customer={customer} 
        setAddInteractionOpen={setAddInteractionOpen} 
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CustomerInfoCard customer={customer} />
        <CustomerLoyaltyCard 
          customerLoyalty={customerLoyalty}
          isLoading={loyaltyLoading}
        />
      </div>
    </div>
  );
}
