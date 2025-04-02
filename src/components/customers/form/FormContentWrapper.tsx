import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { Tabs } from "@/components/ui/tabs";
import { CustomerFormValues } from "./CustomerFormSchema";
import { DuplicateCustomerAlert } from "./DuplicateCustomerAlert";
import { FormTabs } from "./FormTabs";
import { FormContent } from "./FormContent";
import { FormNavigation } from "./FormNavigation";
import { FormErrorSummary } from "./FormErrorSummary";
import { FormStatusAlert } from "./FormStatusAlert";
import { useFormValidation } from "./useFormValidation";
import { useIsMobile } from "@/hooks/use-mobile";

interface FormContentWrapperProps {
  form: UseFormReturn<CustomerFormValues>;
  currentTab: string;
  setCurrentTab: (value: string) => void;
  handleNext: () => void;
  handlePrevious: () => void;
  handleSaveDraft: () => void;
  isSubmitting: boolean;
  onSubmit: (data: CustomerFormValues) => Promise<void>;
  formContext: {
    availableShops: Array<{id: string, name: string}>;
    singleShopMode: boolean;
  };
  isEditMode?: boolean;
  customerId?: string;
}

export const FormContentWrapper: React.FC<FormContentWrapperProps> = ({
  form,
  currentTab,
  setCurrentTab,
  handleNext,
  handlePrevious,
  handleSaveDraft,
  isSubmitting,
  onSubmit,
  formContext,
  isEditMode = false,
  customerId
}) => {
  const isMobile = useIsMobile();
  const { 
    hasErrors, 
    hasPersonalErrors, 
    hasBusinessErrors, 
    hasPreferencesErrors, 
    hasReferralErrors, 
    hasVehicleErrors,
    hasHouseholdErrors,
    hasSegmentErrors
  } = useFormValidation(form);

  const handleFormSubmit = form.handleSubmit(async (data) => {
    console.log("Form submitted with data:", data);
    
    // If we're in single shop mode, ensure we use the current shop
    if (formContext.singleShopMode && formContext.availableShops.length === 1) {
      data.shop_id = formContext.availableShops[0].id;
    }
    
    await onSubmit(data);
  });

  return (
    <Form {...form}>
      <form id="customer-create-form" onSubmit={handleFormSubmit} className="space-y-6">
        {/* Only show duplicate alert for new customers, not when editing */}
        {!isEditMode && <DuplicateCustomerAlert form={form} />}
        
        {/* Show error summary if there are validation errors and form is dirty */}
        {form.formState.isDirty && hasErrors && (
          <FormErrorSummary errors={form.formState.errors} />
        )}

        <Tabs 
          value={currentTab} 
          onValueChange={setCurrentTab} 
          className="w-full"
        >
          <FormTabs 
            currentTab={currentTab}
            setCurrentTab={setCurrentTab}
            hasPersonalErrors={hasPersonalErrors}
            hasBusinessErrors={hasBusinessErrors}
            hasPreferencesErrors={hasPreferencesErrors}
            hasReferralErrors={hasReferralErrors}
            hasVehicleErrors={hasVehicleErrors}
            hasHouseholdErrors={hasHouseholdErrors}
            hasSegmentErrors={hasSegmentErrors}
            isMobile={isMobile}
          />

          <FormContent 
            form={form} 
            currentTab={currentTab} 
            formContext={formContext}
          />

          {/* Step Navigation */}
          <FormNavigation 
            currentTab={currentTab}
            handlePrevious={handlePrevious}
            handleNext={handleNext}
            isSubmitting={isSubmitting}
            isEditMode={isEditMode}
          />
          
          {/* Save Draft Button - Only for new customers */}
          {!isEditMode && (
            <div className="mt-4 flex justify-start">
              <button
                type="button"
                onClick={handleSaveDraft}
                className="text-sm text-gray-600 hover:text-gray-800 flex items-center"
              >
                Save as Draft
              </button>
            </div>
          )}
        </Tabs>
        
        {/* Form completion status */}
        {form.formState.isValid && form.formState.isDirty && (
          <FormStatusAlert />
        )}
      </form>
    </Form>
  );
};
