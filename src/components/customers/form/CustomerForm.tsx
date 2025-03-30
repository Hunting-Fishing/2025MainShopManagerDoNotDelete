
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Card } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Check } from "lucide-react";
import { PersonalInfoFields } from "./PersonalInfoFields";
import { BusinessInfoFields } from "./BusinessInfoFields";
import { PreferencesFields } from "./PreferencesFields";
import { ReferralFields } from "./ReferralFields";
import { FleetFields } from "./FleetFields";
import { VehiclesFields } from "./VehiclesFields";
import { CustomerFormActions } from "./CustomerFormActions";
import { customerSchema, CustomerFormValues } from "./CustomerFormSchema";
import { NotificationsProvider } from "@/context/notifications";

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

  // Check if there are any validation errors
  const hasErrors = Object.keys(form.formState.errors).length > 0;

  // Format error messages for display
  const getErrorSummary = () => {
    const errors = form.formState.errors;
    const errorFields = Object.keys(errors);
    
    if (errorFields.length === 0) return null;
    
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Validation Errors</AlertTitle>
        <AlertDescription>
          <p>Please fix the following errors:</p>
          <ul className="list-disc list-inside mt-2">
            {errorFields.map(field => (
              <li key={field}>{errors[field as keyof typeof errors]?.message?.toString()}</li>
            ))}
          </ul>
        </AlertDescription>
      </Alert>
    );
  };

  return (
    <NotificationsProvider>
      <Card>
        <div className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Show error summary if there are validation errors and form is dirty */}
              {form.formState.isDirty && hasErrors && getErrorSummary()}

              <div className="grid grid-cols-1 gap-6">
                <PersonalInfoFields form={form} />
              </div>

              <div className="grid grid-cols-1 gap-6 pt-4">
                <BusinessInfoFields form={form} />
              </div>
              
              <div className="grid grid-cols-1 gap-6 pt-4">
                <PreferencesFields form={form} />
              </div>
              
              <div className="grid grid-cols-1 gap-6 pt-4">
                <ReferralFields form={form} />
              </div>
              
              <div className="grid grid-cols-1 gap-6 pt-4">
                <FleetFields form={form} />
              </div>
              
              <div className="grid grid-cols-1 gap-6 pt-4">
                <VehiclesFields form={form} />
              </div>

              <CustomerFormActions isSubmitting={isSubmitting} />

              {/* Form completion status */}
              {form.formState.isValid && form.formState.isDirty && (
                <Alert variant="success" className="mt-4">
                  <Check className="h-4 w-4" />
                  <AlertTitle>Form Ready</AlertTitle>
                  <AlertDescription>
                    All required fields are completed correctly.
                  </AlertDescription>
                </Alert>
              )}
            </form>
          </Form>
        </div>
      </Card>
    </NotificationsProvider>
  );
};
