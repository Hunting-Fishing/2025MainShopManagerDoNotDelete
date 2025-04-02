
import React from "react";
import { CreateCustomerHeader } from "@/components/customers/create/CreateCustomerHeader";
import { CreateCustomerSuccess } from "@/components/customers/create/CreateCustomerSuccess";
import { CustomerCreateForm } from "@/components/customers/create/CustomerCreateForm";
import { useCustomerCreate } from "@/components/customers/create/useCustomerCreate";

export default function CreateCustomer() {
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

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4 sm:px-6">
      <CreateCustomerHeader 
        onImportComplete={handleImportComplete} 
        isSubmitting={isSubmitting}
      />

      {isSuccess && newCustomerId ? (
        <CreateCustomerSuccess customerId={newCustomerId} />
      ) : (
        <CustomerCreateForm 
          defaultValues={defaultValues} 
          onSubmit={onSubmit} 
          isSubmitting={isSubmitting}
          isLoading={isLoading}
          availableShops={availableShops}
        />
      )}
    </div>
  );
}
