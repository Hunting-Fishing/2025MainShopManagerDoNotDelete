
import React from 'react';
import { Customer } from '@/types/customer';
import { CustomerAnalyticsSection } from './CustomerAnalyticsSection';

interface CustomerAnalyticsTabProps {
  customer: Customer;
}

export function CustomerAnalyticsTab({ customer }: CustomerAnalyticsTabProps) {
  return (
    <div className="space-y-6">
      <CustomerAnalyticsSection customer={customer} />
    </div>
  );
}
