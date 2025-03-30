
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Card } from "@/components/ui/card";
import { PersonalInfoFields } from "./PersonalInfoFields";
import { BusinessInfoFields } from "./BusinessInfoFields";
import { CustomerFormActions } from "./CustomerFormActions";
import { customerSchema, CustomerFormValues } from "./CustomerFormSchema";

interface CustomerFormProps {
  defaultValues: CustomerFormValues;
  onSubmit: (data: CustomerFormValues) => Promise<void>;
  isSubmitting: boolean;
}

export const CustomerForm: React.FC<CustomerFormProps> = ({ 
  defaultValues, 
  onSubmit, 
  isSubmitting 
}) => {
  // Initialize form with validation
  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues,
  });

  return (
    <Card>
      <div className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <PersonalInfoFields form={form} />
            </div>

            <div className="grid grid-cols-1 gap-6 pt-4">
              <BusinessInfoFields form={form} />
            </div>

            <CustomerFormActions isSubmitting={isSubmitting} />
          </form>
        </Form>
      </div>
    </Card>
  );
};
