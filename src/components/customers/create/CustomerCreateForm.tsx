
import React, { forwardRef } from "react";
import { Card } from "@/components/ui/card";
import { CustomerForm } from "@/components/customers/form/CustomerForm";
import { CustomerFormValues } from "@/components/customers/form/CustomerFormSchema";

interface CustomerCreateFormProps {
  defaultValues: CustomerFormValues;
  onSubmit: (data: CustomerFormValues) => Promise<void>;
  isSubmitting: boolean;
  formRef?: React.RefObject<{ submit: () => void }>;
}

export const CustomerCreateForm: React.FC<CustomerCreateFormProps> = ({
  defaultValues,
  onSubmit,
  isSubmitting,
  formRef
}) => {
  return (
    <Card className="p-6">
      <CustomerForm 
        defaultValues={defaultValues} 
        onSubmit={onSubmit} 
        isSubmitting={isSubmitting}
        formRef={formRef}
      />
    </Card>
  );
};
