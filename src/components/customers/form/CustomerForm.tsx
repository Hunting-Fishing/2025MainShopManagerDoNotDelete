
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card } from "@/components/ui/card";
import { customerSchema, CustomerFormValues, shops as defaultShops } from "./CustomerFormSchema";
import { NotificationsProvider } from "@/context/notifications";
import { useFormNavigation } from "./useFormNavigation";
import { FormContentWrapper } from "./FormContentWrapper";
import { PreviewToggle } from "./preview/PreviewToggle";
import { useDraftCustomer } from "./hooks/useDraftCustomer";
import { FloatingActionButton } from "./FloatingActionButton";

interface CustomerFormProps {
  defaultValues: CustomerFormValues;
  onSubmit: (data: CustomerFormValues) => Promise<void>;
  isSubmitting: boolean;
  availableShops?: Array<{id: string, name: string}>;
  singleShopMode?: boolean;
  isEditMode?: boolean;
  customerId?: string;
}

export const CustomerForm: React.FC<CustomerFormProps> = ({ 
  defaultValues, 
  onSubmit, 
  isSubmitting,
  availableShops = defaultShops,
  singleShopMode = false,
  isEditMode = false,
  customerId
}) => {
  // Initialize form with validation
  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues,
    mode: "onChange" // Enable real-time validation as the user types
  });
  
  useEffect(() => {
    if (defaultValues.shop_id) {
      form.setValue('shop_id', defaultValues.shop_id);
    }
  }, [defaultValues.shop_id, form]);
  
  // Get navigation state and handlers
  const { currentTab, setCurrentTab, handleNext, handlePrevious } = useFormNavigation();
  
  // Get draft functionality
  const { handleSaveDraft } = useDraftCustomer({ 
    form, 
    singleShopMode, 
    availableShops 
  });

  // Handle floating action button click
  const handleFloatingSubmit = () => {
    form.handleSubmit(async (data) => {
      console.log("Form submitted with data:", data);
      
      // If we're in single shop mode, ensure we use the current shop
      if (singleShopMode && availableShops.length === 1) {
        data.shop_id = availableShops[0].id;
      }
      
      await onSubmit(data);
    })();
  };

  // Make the available shops and single shop mode accessible to form fields
  const formContext = {
    availableShops,
    singleShopMode
  };

  return (
    <NotificationsProvider>
      <Card>
        <div className="p-4 sm:p-6">
          <PreviewToggle formData={form.getValues()} />

          <FormContentWrapper 
            form={form}
            currentTab={currentTab}
            setCurrentTab={setCurrentTab}
            handleNext={handleNext}
            handlePrevious={handlePrevious}
            handleSaveDraft={handleSaveDraft}
            isSubmitting={isSubmitting}
            onSubmit={onSubmit}
            formContext={formContext}
            isEditMode={isEditMode}
            customerId={customerId}
          />
        </div>
      </Card>
      
      {/* Only show floating action button in edit mode */}
      {isEditMode && (
        <FloatingActionButton 
          isSubmitting={isSubmitting} 
          isEditMode={isEditMode}
          onClick={handleFloatingSubmit}
        />
      )}
    </NotificationsProvider>
  );
};
