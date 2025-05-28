
import React from 'react';
import { CreateCustomerHeader } from '@/components/customers/create/CreateCustomerHeader';
import { CustomerCreateForm } from '@/components/customers/create/CustomerCreateForm';
import { useCustomerCreate } from '@/components/customers/create/hooks/useCustomerCreate';

export default function CreateCustomer() {
  const {
    defaultValues,
    availableShops,
    isLoading,
    isSubmitting,
    handleSubmit
  } = useCustomerCreate();

  return (
    <div className="container mx-auto px-4 py-8">
      <CreateCustomerHeader />
      <div className="mt-8">
        <CustomerCreateForm
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          isLoading={isLoading}
          availableShops={availableShops}
        />
      </div>
    </div>
  );
}
