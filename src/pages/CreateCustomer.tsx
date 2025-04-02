
import React from "react";
import { CreateCustomerHeader } from "@/components/customers/create/CreateCustomerHeader";
import { CreateCustomerSuccess } from "@/components/customers/create/CreateCustomerSuccess";
import { CustomerCreateForm } from "@/components/customers/create/CustomerCreateForm";
import { useCustomerCreate } from "@/components/customers/create/useCustomerCreate";

export default function CustomerCreate() {
  const {
    isSubmitting,
    isSuccess,
    newCustomerId,
    defaultValues,
    onSubmit,
    handleImportComplete,
    handleSubmitForm,
    formRef
  } = useCustomerCreate();

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4 sm:px-6">
      <CreateCustomerHeader 
        onImportComplete={handleImportComplete} 
        isSubmitting={isSubmitting}
        onSubmit={handleSubmitForm}
      />

      {isSuccess && newCustomerId ? (
        <CreateCustomerSuccess customerId={newCustomerId} />
      ) : (
        <CustomerCreateForm 
          defaultValues={defaultValues} 
          onSubmit={onSubmit} 
          isSubmitting={isSubmitting}
          formRef={formRef}
        />
      )}
    </div>
  );
}
