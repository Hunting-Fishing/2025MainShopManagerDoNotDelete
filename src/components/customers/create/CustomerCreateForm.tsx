
import React from "react";
import { Card } from "@/components/ui/card";
import { CustomerForm } from "@/components/customers/form/CustomerForm";
import { CustomerFormValues } from "@/components/customers/form/CustomerFormSchema";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";

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
      
      <div className="mt-6 flex justify-end">
        <Button
          type="submit"
          form="customer-create-form"
          disabled={isSubmitting}
          className="flex items-center gap-2"
        >
          <UserPlus size={18} />
          {isSubmitting ? "Creating Customer..." : "Create New Customer"}
        </Button>
      </div>
    </Card>
  );
};
