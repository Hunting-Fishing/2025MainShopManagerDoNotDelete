
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CustomerFormValues, customerSchema } from "./schemas/customerSchema";
import { useFormNavigation } from "./useFormNavigation";
import { FormContentWrapper } from "./FormContentWrapper";

interface CustomerFormProps {
  defaultValues?: CustomerFormValues;
  onSubmit: (data: CustomerFormValues) => Promise<void>;
  isSubmitting?: boolean;
  availableShops?: Array<{ id: string; name: string }>;
  singleShopMode?: boolean;
  isEditMode?: boolean;
  customerId?: string;
  initialTab?: string;
  onDirtyStateChange?: (isDirty: boolean) => void;
}

export const CustomerForm: React.FC<CustomerFormProps> = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  availableShops = [],
  singleShopMode = false,
  isEditMode = false,
  customerId,
  initialTab,
  onDirtyStateChange
}) => {
  const {
    currentTab,
    setCurrentTab,
    handleNext,
    handlePrevious,
    currentStep,
    totalSteps,
    progressPercentage
  } = useFormNavigation();
  
  // Set initial tab if provided
  React.useEffect(() => {
    if (initialTab) {
      setCurrentTab(initialTab);
    }
  }, [initialTab, setCurrentTab]);
  
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
    mode: "onChange", // Enable real-time validation
  });
  
  // Track form dirty state for parent component
  useEffect(() => {
    if (onDirtyStateChange) {
      onDirtyStateChange(form.formState.isDirty);
    }
  }, [form.formState.isDirty, onDirtyStateChange]);

  const handleFormSubmit = async (data: CustomerFormValues) => {
    await onSubmit(data);
  };
  
  // Placeholder for save draft functionality
  const handleSaveDraft = () => {
    console.log("Saving as draft:", form.getValues());
    // Implement actual save draft logic here
  };

  return (
    <div className="space-y-8 pb-10 relative">
      <FormContentWrapper
        form={form}
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        handleNext={handleNext}
        handlePrevious={handlePrevious}
        handleSaveDraft={handleSaveDraft}
        isSubmitting={isSubmitting}
        onSubmit={handleFormSubmit}
        formContext={{
          availableShops,
          singleShopMode
        }}
        isEditMode={isEditMode}
        customerId={customerId}
        currentStep={currentStep}
        totalSteps={totalSteps}
        progressPercentage={progressPercentage}
      />
    </div>
  );
};
