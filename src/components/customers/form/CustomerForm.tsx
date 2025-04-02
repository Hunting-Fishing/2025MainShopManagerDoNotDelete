
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Card } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { customerSchema, CustomerFormValues } from "./CustomerFormSchema";
import { NotificationsProvider } from "@/context/notifications";
import { useIsMobile } from "@/hooks/use-mobile";
import { DuplicateCustomerAlert } from "./DuplicateCustomerAlert";
import { CustomerFormActions } from "./CustomerFormActions";
import { FormTabs } from "./FormTabs";
import { FormContent } from "./FormContent";
import { FormNavigation } from "./FormNavigation";
import { FormErrorSummary } from "./FormErrorSummary";
import { FormStatusAlert } from "./FormStatusAlert";
import { useFormValidation } from "./useFormValidation";
import { useFormNavigation } from "./useFormNavigation";
import { saveDraftCustomer, getDraftCustomer } from "@/services/customers/customerDraftService";
import { useToast } from "@/hooks/use-toast";
import { CustomerPreview } from "./preview/CustomerPreview";

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
  const [showPreview, setShowPreview] = useState(false);
  const { toast } = useToast();
  
  // Initialize form with validation
  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues,
    mode: "onChange" // Enable real-time validation as the user types
  });
  
  const isMobile = useIsMobile();
  const { currentTab, setCurrentTab, handleNext, handlePrevious } = useFormNavigation();
  const { 
    hasErrors, 
    hasPersonalErrors, 
    hasBusinessErrors, 
    hasPreferencesErrors, 
    hasReferralFleetErrors, 
    hasVehicleErrors 
  } = useFormValidation(form);

  // Load draft data on component mount
  useEffect(() => {
    const loadDraft = async () => {
      try {
        const draft = await getDraftCustomer();
        if (draft) {
          form.reset(draft);
          toast({
            title: "Draft Loaded",
            description: "Your previously saved draft has been loaded.",
            variant: "default",
          });
        }
      } catch (error) {
        console.error("Failed to load draft:", error);
      }
    };
    
    loadDraft();
  }, [form, toast]);

  // Save draft function
  const handleSaveDraft = async () => {
    try {
      const formData = form.getValues();
      await saveDraftCustomer(formData);
      toast({
        title: "Draft Saved",
        description: "Your customer information has been saved as a draft.",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save draft. Please try again.",
        variant: "destructive",
      });
      console.error("Failed to save draft:", error);
    }
  };

  // Handle form submission
  const handleFormSubmit = form.handleSubmit(async (data) => {
    console.log("Form submitted with data:", data);
    await onSubmit(data);
  });

  return (
    <NotificationsProvider>
      <Card>
        <div className="p-4 sm:p-6">
          <div className="flex justify-end mb-4">
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
            >
              {showPreview ? "Hide Preview" : "Show Preview"}
            </button>
          </div>

          {showPreview && (
            <div className="mb-6">
              <CustomerPreview customerData={form.getValues()} />
            </div>
          )}

          <Form {...form}>
            <form id="customer-create-form" onSubmit={handleFormSubmit} className="space-y-6">
              {/* Check for duplicate customers */}
              <DuplicateCustomerAlert form={form} />
              
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
                  hasReferralFleetErrors={hasReferralFleetErrors}
                  hasVehicleErrors={hasVehicleErrors}
                  isMobile={isMobile}
                />

                <FormContent form={form} currentTab={currentTab} />

                {/* Step Navigation */}
                <FormNavigation 
                  currentTab={currentTab}
                  handlePrevious={handlePrevious}
                  handleNext={handleNext}
                  isSubmitting={isSubmitting}
                />
                
                {/* Save Draft Button */}
                <div className="mt-4 flex justify-start">
                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    className="text-sm text-gray-600 hover:text-gray-800 flex items-center"
                  >
                    Save as Draft
                  </button>
                </div>
              </Tabs>
              
              {/* Form completion status */}
              {form.formState.isValid && form.formState.isDirty && (
                <FormStatusAlert />
              )}
            </form>
          </Form>
        </div>
      </Card>
    </NotificationsProvider>
  );
};
