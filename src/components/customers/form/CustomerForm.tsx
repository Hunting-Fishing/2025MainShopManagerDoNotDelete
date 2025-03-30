
import React from "react";
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

  return (
    <NotificationsProvider>
      <Card>
        <div className="p-4 sm:p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
