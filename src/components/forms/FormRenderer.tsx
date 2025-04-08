
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { FormBuilderTemplate } from '@/types/formBuilder';
import { 
  useFormSubmission, 
  useFormProcessor, 
  FormFieldValue 
} from '@/hooks/useFormSubmission';
import { toast } from 'sonner';

interface FormRendererProps {
  template: FormBuilderTemplate;
  customerId?: string;
  vehicleId?: string;
  workOrderId?: string;
  onComplete?: () => void;
}

export const FormRenderer: React.FC<FormRendererProps> = ({
  template,
  customerId,
  vehicleId,
  workOrderId,
  onComplete
}) => {
  const [submitted, setSubmitted] = useState(false);
  
  const { 
    submitForm, 
    isSubmitting, 
    error, 
    success 
  } = useFormSubmission();
  
  const {
    formValues,
    errors,
    updateFieldValue,
    validateForm,
    getSubmissionData,
    resetForm
  } = useFormProcessor(template);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }
    
    const result = await submitForm({
      templateId: template.id,
      customerId,
      vehicleId,
      workOrderId,
      data: getSubmissionData()
    });
    
    if (result) {
      setSubmitted(true);
      toast.success("Form submitted successfully");
      resetForm();
      if (onComplete) onComplete();
    } else {
      toast.error(error || "Failed to submit form");
    }
  };

  const renderField = (section: any, field: any) => {
    const fieldValue = formValues[field.id]?.value;
    const fieldError = errors[field.id];
    
    const handleValueChange = (value: any) => {
      updateFieldValue(field.id, value, field.fieldType, field.label);
    };
    
    return (
      <div key={field.id} className="space-y-2 mb-4">
        <Label 
          htmlFor={`field-${field.id}`}
          className="flex items-center"
        >
          {field.label}
          {field.isRequired && (
            <span className="text-red-500 ml-1">*</span>
          )}
        </Label>
        
        {field.fieldType === 'text' && (
          <Input
            id={`field-${field.id}`}
            placeholder={field.placeholder || ''}
            value={(fieldValue as string) || ''}
            onChange={(e) => handleValueChange(e.target.value)}
            className={fieldError ? "border-red-500" : ""}
          />
        )}
        
        {field.fieldType === 'textarea' && (
          <Textarea
            id={`field-${field.id}`}
            placeholder={field.placeholder || ''}
            value={(fieldValue as string) || ''}
            onChange={(e) => handleValueChange(e.target.value)}
            className={fieldError ? "border-red-500" : ""}
            rows={4}
          />
        )}
        
        {field.fieldType === 'number' && (
          <Input
            id={`field-${field.id}`}
            type="number"
            placeholder={field.placeholder || ''}
            value={(fieldValue as string) || ''}
            onChange={(e) => handleValueChange(e.target.value ? Number(e.target.value) : '')}
            className={fieldError ? "border-red-500" : ""}
          />
        )}
        
        {field.fieldType === 'email' && (
          <Input
            id={`field-${field.id}`}
            type="email"
            placeholder={field.placeholder || ''}
            value={(fieldValue as string) || ''}
            onChange={(e) => handleValueChange(e.target.value)}
            className={fieldError ? "border-red-500" : ""}
          />
        )}
        
        {field.fieldType === 'select' && (
          <Select
            value={(fieldValue as string) || ''}
            onValueChange={handleValueChange}
          >
            <SelectTrigger 
              id={`field-${field.id}`}
              className={fieldError ? "border-red-500" : ""}
            >
              <SelectValue placeholder={field.placeholder || 'Select an option'} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option: any, i: number) => (
                <SelectItem key={i} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        
        {field.fieldType === 'checkbox' && field.options && (
          <div className="space-y-2">
            {field.options.map((option: any, i: number) => {
              const values = Array.isArray(fieldValue) ? fieldValue : [];
              const isChecked = values.includes(option.value);
              
              return (
                <div key={i} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${field.id}-${i}`}
                    checked={isChecked}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        handleValueChange([...values, option.value]);
                      } else {
                        handleValueChange(values.filter((v: string) => v !== option.value));
                      }
                    }}
                  />
                  <Label htmlFor={`${field.id}-${i}`}>{option.label}</Label>
                </div>
              );
            })}
          </div>
        )}
        
        {field.fieldType === 'radio' && field.options && (
          <div className="space-y-2">
            {field.options.map((option: any, i: number) => (
              <div key={i} className="flex items-center space-x-2">
                <input
                  type="radio"
                  id={`${field.id}-${i}`}
                  name={`radio-${field.id}`}
                  checked={(fieldValue as string) === option.value}
                  onChange={() => handleValueChange(option.value)}
                  className="h-4 w-4"
                />
                <Label htmlFor={`${field.id}-${i}`}>{option.label}</Label>
              </div>
            ))}
          </div>
        )}
        
        {field.fieldType === 'date' && (
          <Input
            id={`field-${field.id}`}
            type="date"
            value={(fieldValue as string) || ''}
            onChange={(e) => handleValueChange(e.target.value)}
            className={fieldError ? "border-red-500" : ""}
          />
        )}
        
        {field.fieldType === 'file' && (
          <Input
            id={`field-${field.id}`}
            type="file"
            onChange={(e) => {
              const file = e.target.files?.[0];
              handleValueChange(file ? file.name : null);
              // In a real implementation, you'd handle file upload here
            }}
            className={fieldError ? "border-red-500" : ""}
          />
        )}
        
        {field.helpText && (
          <p className="text-xs text-muted-foreground">{field.helpText}</p>
        )}
        
        {fieldError && (
          <p className="text-xs text-red-500">{fieldError}</p>
        )}
      </div>
    );
  };

  if (submitted) {
    return (
      <div className="p-6 bg-green-50 rounded-md border border-green-200 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600 mb-4">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor" 
            className="w-6 h-6"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-medium text-gray-900 mb-2">
          Thank you!
        </h3>
        <p className="text-gray-600 mb-4">
          Your form has been submitted successfully.
        </p>
        <Button onClick={() => setSubmitted(false)}>
          Submit Another Response
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <h2 className="text-2xl font-bold mb-2">{template.name}</h2>
        {template.description && (
          <p className="text-gray-600 mb-6">{template.description}</p>
        )}
        
        <form onSubmit={handleSubmit}>
          {template.sections
            .sort((a, b) => a.displayOrder - b.displayOrder)
            .map((section) => (
              <div key={section.id} className="mb-8">
                <h3 className="text-xl font-semibold mb-2">
                  {section.title}
                </h3>
                
                {section.description && (
                  <p className="text-gray-600 mb-4">
                    {section.description}
                  </p>
                )}
                
                <div className="space-y-4 border-l-2 border-gray-200 pl-4">
                  {section.fields
                    .sort((a, b) => a.displayOrder - b.displayOrder)
                    .map((field) => renderField(section, field))
                  }
                </div>
              </div>
            ))
          }
          
          <div className="mt-6 flex justify-end">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="px-6"
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
