
import React from "react";
import { Card } from "@/components/ui/card";
import { CustomerForm } from "@/components/customers/form/CustomerForm";
import { CustomerFormValues } from "@/components/customers/form/CustomerFormSchema";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface CustomerCreateFormProps {
  defaultValues: CustomerFormValues;
  onSubmit: (data: CustomerFormValues) => Promise<void>;
  isSubmitting: boolean;
  isLoading?: boolean;
  availableShops?: Array<{id: string, name: string}>;
}

export const CustomerCreateForm: React.FC<CustomerCreateFormProps> = ({
  defaultValues,
  onSubmit,
  isSubmitting,
  isLoading = false,
  availableShops = []
}) => {
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex flex-col items-center justify-center h-64">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-muted-foreground">Loading shop data...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <CustomerForm 
        defaultValues={defaultValues} 
        onSubmit={onSubmit} 
        isSubmitting={isSubmitting}
        availableShops={availableShops}
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
