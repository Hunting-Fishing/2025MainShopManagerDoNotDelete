
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
    onSubmit
  } = useCustomerCreate();

  return (
    <div className="container mx-auto px-4 py-8">
      <CreateCustomerHeader 
        onImportComplete={() => {}}
        isSubmitting={isSubmitting}
      />
      <div className="mt-8">
        <CustomerCreateForm
          defaultValues={defaultValues}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
          isLoading={isLoading}
          availableShops={availableShops}
        />
      </div>
    </div>
  );
}
