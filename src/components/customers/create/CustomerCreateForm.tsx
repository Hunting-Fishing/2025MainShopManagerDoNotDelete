
import React from "react";
import { Card } from "@/components/ui/card";
import { CustomerForm } from "@/components/customers/form/CustomerForm";
import { CustomerFormValues } from "@/components/customers/form/CustomerFormSchema";

interface CustomerCreateFormProps {
  defaultValues: CustomerFormValues;
  onSubmit: (data: CustomerFormValues) => Promise<void>;
  isSubmitting: boolean;
}

export const CustomerCreateForm: React.FC<CustomerCreateFormProps> = ({
  defaultValues,
  onSubmit,
  isSubmitting
}) => {
  return (
    <Card className="p-6">
      <CustomerForm 
        defaultValues={defaultValues} 
        onSubmit={onSubmit} 
        isSubmitting={isSubmitting}
      />
    </Card>
  );
};
