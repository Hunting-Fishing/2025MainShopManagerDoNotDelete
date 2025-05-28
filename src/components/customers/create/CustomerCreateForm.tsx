
import React from 'react';
import { CustomerForm } from '@/components/customers/form/CustomerForm';
import { useCustomerCreate } from './hooks/useCustomerCreate';

export function CustomerCreateForm() {
  const {
    isSubmitting,
    isSuccess,
    isLoading,
    newCustomerId,
    defaultValues,
    availableShops,
    onSubmit,
    handleImportComplete,
  } = useCustomerCreate();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <CustomerForm
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
      newCustomerId={newCustomerId}
      availableShops={availableShops}
      onImportComplete={handleImportComplete}
    />
  );
}
