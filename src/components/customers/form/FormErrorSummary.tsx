
import React from "react";
import { FieldErrors } from "react-hook-form";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { CustomerFormValues } from "./CustomerFormSchema";

interface FormErrorSummaryProps {
  errors: FieldErrors<CustomerFormValues>;
}

export const FormErrorSummary: React.FC<FormErrorSummaryProps> = ({ errors }) => {
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
