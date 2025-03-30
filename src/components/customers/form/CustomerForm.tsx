
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Card } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PersonalInfoFields } from "./PersonalInfoFields";
import { BusinessInfoFields } from "./BusinessInfoFields";
import { PreferencesFields } from "./PreferencesFields";
import { ReferralFields } from "./ReferralFields";
import { FleetFields } from "./FleetFields";
import { VehiclesFields } from "./VehiclesFields";
import { CustomerFormActions } from "./CustomerFormActions";
import { customerSchema, CustomerFormValues } from "./CustomerFormSchema";
import { NotificationsProvider } from "@/context/notifications";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";
import { Badge } from "@/components/ui/badge";

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
  
  const [currentTab, setCurrentTab] = useState("personal");
  const isMobile = useIsMobile();

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

  // Check for errors in each section for the step indicator
  const hasPersonalErrors = ["first_name", "last_name", "email", "phone", "address"].some(
    field => !!form.formState.errors[field as keyof CustomerFormValues]
  );
  
  const hasBusinessErrors = ["company", "shop_id", "notes"].some(
    field => !!form.formState.errors[field as keyof CustomerFormValues]
  );
  
  const hasPreferencesErrors = ["preferred_technician_id"].some(
    field => !!form.formState.errors[field as keyof CustomerFormValues]
  );
  
  const hasReferralFleetErrors = ["referral_source", "referral_person_id", "is_fleet", "fleet_company"].some(
    field => !!form.formState.errors[field as keyof CustomerFormValues]
  );
  
  const hasVehicleErrors = form.formState.errors.vehicles ? true : false;

  const handleNext = () => {
    switch (currentTab) {
      case "personal":
        setCurrentTab("business");
        break;
      case "business":
        setCurrentTab("preferences");
        break;
      case "preferences":
        setCurrentTab("referral");
        break;
      case "referral":
        setCurrentTab("vehicles");
        break;
      default:
        break;
    }
  };

  const handlePrevious = () => {
    switch (currentTab) {
      case "business":
        setCurrentTab("personal");
        break;
      case "preferences":
        setCurrentTab("business");
        break;
      case "referral":
        setCurrentTab("preferences");
        break;
      case "vehicles":
        setCurrentTab("referral");
        break;
      default:
        break;
    }
  };

  return (
    <NotificationsProvider>
      <Card>
        <div className="p-4 sm:p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Show error summary if there are validation errors and form is dirty */}
              {form.formState.isDirty && hasErrors && getErrorSummary()}

              <Tabs 
                value={currentTab} 
                onValueChange={setCurrentTab} 
                className="w-full"
              >
                <div className="overflow-x-auto pb-2">
                  <TabsList className={`w-full flex ${isMobile ? "justify-start" : "justify-between"} mb-6`}>
                    <TabsTrigger 
                      value="personal" 
                      className={`${isMobile ? "flex-shrink-0" : "flex-1"} relative`}
                    >
                      Personal Info
                      {hasPersonalErrors && (
                        <Badge variant="destructive" className="absolute -top-2 -right-2 h-4 w-4 p-0 flex items-center justify-center rounded-full">!</Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger 
                      value="business" 
                      className={`${isMobile ? "flex-shrink-0" : "flex-1"} relative`}
                    >
                      Business
                      {hasBusinessErrors && (
                        <Badge variant="destructive" className="absolute -top-2 -right-2 h-4 w-4 p-0 flex items-center justify-center rounded-full">!</Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger 
                      value="preferences" 
                      className={`${isMobile ? "flex-shrink-0" : "flex-1"} relative`}
                    >
                      Preferences
                      {hasPreferencesErrors && (
                        <Badge variant="destructive" className="absolute -top-2 -right-2 h-4 w-4 p-0 flex items-center justify-center rounded-full">!</Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger 
                      value="referral" 
                      className={`${isMobile ? "flex-shrink-0" : "flex-1"} relative`}
                    >
                      Referral
                      {hasReferralFleetErrors && (
                        <Badge variant="destructive" className="absolute -top-2 -right-2 h-4 w-4 p-0 flex items-center justify-center rounded-full">!</Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger 
                      value="vehicles" 
                      className={`${isMobile ? "flex-shrink-0" : "flex-1"} relative`}
                    >
                      Vehicles
                      {hasVehicleErrors && (
                        <Badge variant="destructive" className="absolute -top-2 -right-2 h-4 w-4 p-0 flex items-center justify-center rounded-full">!</Badge>
                      )}
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="personal" className="mt-0">
                  <div className="grid grid-cols-1 gap-6">
                    <PersonalInfoFields form={form} />
                  </div>
                </TabsContent>

                <TabsContent value="business" className="mt-0">
                  <div className="grid grid-cols-1 gap-6">
                    <BusinessInfoFields form={form} />
                  </div>
                </TabsContent>
                
                <TabsContent value="preferences" className="mt-0">
                  <div className="grid grid-cols-1 gap-6">
                    <PreferencesFields form={form} />
                  </div>
                </TabsContent>
                
                <TabsContent value="referral" className="mt-0">
                  <div className="grid grid-cols-1 gap-6">
                    <ReferralFields form={form} />
                    <FleetFields form={form} />
                  </div>
                </TabsContent>
                
                <TabsContent value="vehicles" className="mt-0">
                  <div className="grid grid-cols-1 gap-6">
                    <VehiclesFields form={form} />
                  </div>
                </TabsContent>

                {/* Step Navigation */}
                <div className="flex justify-between mt-6">
                  {currentTab !== "personal" && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handlePrevious}
                    >
                      Previous
                    </Button>
                  )}
                  
                  <div className="flex-1"></div>
                  
                  {currentTab !== "vehicles" ? (
                    <Button 
                      type="button" 
                      onClick={handleNext}
                    >
                      Next
                    </Button>
                  ) : (
                    <CustomerFormActions isSubmitting={isSubmitting} />
                  )}
                </div>
              </Tabs>
              
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
