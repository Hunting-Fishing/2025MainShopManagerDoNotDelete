
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { CustomerFormValues, customerSchema } from "./schemas/customerSchema";
import { FormTabs } from "./FormTabs";
import { FormContent } from "./FormContent";
import { CustomerFormActions } from "./CustomerFormActions";

interface CustomerFormProps {
  defaultValues?: CustomerFormValues;
  onSubmit: (data: CustomerFormValues) => void;
  isSubmitting?: boolean;
  availableShops?: Array<{ id: string; name: string }>;
  singleShopMode?: boolean;
  isEditMode?: boolean;
  customerId?: string;
  initialTab?: string;
}

export const CustomerForm: React.FC<CustomerFormProps> = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  availableShops = [],
  singleShopMode = false,
  isEditMode = false,
  customerId,
  initialTab
}) => {
  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: defaultValues || {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      shop_id: singleShopMode && availableShops.length === 1 
        ? availableShops[0]?.id
        : "",
      vehicles: [],
      tags: [],
      segments: [],
      is_fleet: false,
      auto_billing: false,
      terms_agreed: false,
      create_new_household: false
    },
  });

  const handleFormSubmit = (data: CustomerFormValues) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form 
        onSubmit={form.handleSubmit(handleFormSubmit)} 
        className="space-y-8 pb-10 relative"
      >
        <FormTabs initialTab={initialTab} />
        <FormContent 
          form={form} 
          availableShops={availableShops} 
          singleShopMode={singleShopMode} 
          isEditMode={isEditMode}
          customerId={customerId}
        />
        <CustomerFormActions 
          isSubmitting={isSubmitting} 
          isEditMode={isEditMode}
        />
      </form>
    </Form>
  );
};
