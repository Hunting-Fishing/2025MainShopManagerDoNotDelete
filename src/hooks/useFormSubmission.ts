
import { useState } from 'react';
import { FormBuilderTemplate } from '@/types/formBuilder';
import { supabase } from '@/lib/supabase';

interface FormSubmissionData {
  templateId: string;
  customerId?: string;
  vehicleId?: string;
  workOrderId?: string;
  data: Record<string, any>;
}

export function useFormSubmission() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const submitForm = async (submissionData: FormSubmissionData): Promise<boolean> => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);
    
    try {
      const { error } = await supabase
        .from('form_submissions')
        .insert({
          template_id: submissionData.templateId,
          customer_id: submissionData.customerId || null,
          vehicle_id: submissionData.vehicleId || null,
          work_order_id: submissionData.workOrderId || null,
          submitted_by: (await supabase.auth.getUser()).data.user?.id,
          submitted_data: submissionData.data
        });
      
      if (error) throw error;
      
      setSuccess(true);
      return true;
    } catch (err) {
      console.error('Error submitting form:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while submitting the form');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetStatus = () => {
    setError(null);
    setSuccess(false);
  };

  return {
    submitForm,
    isSubmitting,
    error,
    success,
    resetStatus
  };
}

export interface FormFieldValue {
  fieldId: string;
  label: string;
  value: string | string[] | boolean | number | null;
  fieldType: string;
}

export function useFormProcessor(template: FormBuilderTemplate) {
  const [formValues, setFormValues] = useState<Record<string, FormFieldValue>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const updateFieldValue = (fieldId: string, value: any, fieldType: string, label: string) => {
    setFormValues(prev => ({
      ...prev,
      [fieldId]: { 
        fieldId, 
        value, 
        fieldType, 
        label 
      }
    }));
    
    // Clear error for this field if it exists
    if (errors[fieldId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  };
  
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;
    
    template.sections.forEach(section => {
      section.fields.forEach(field => {
        // Check required fields
        if (field.isRequired) {
          const fieldValue = formValues[field.id]?.value;
          
          if (fieldValue === undefined || fieldValue === null || fieldValue === '') {
            newErrors[field.id] = 'This field is required';
            isValid = false;
          }
        }
        
        // Additional validation based on field type could be added here
      });
    });
    
    setErrors(newErrors);
    return isValid;
  };
  
  const getSubmissionData = () => {
    const processedData: Record<string, any> = {};
    
    Object.values(formValues).forEach(field => {
      processedData[field.fieldId] = {
        label: field.label,
        value: field.value,
        type: field.fieldType
      };
    });
    
    return processedData;
  };
  
  const resetForm = () => {
    setFormValues({});
    setErrors({});
  };
  
  return {
    formValues,
    errors,
    updateFieldValue,
    validateForm,
    getSubmissionData,
    resetForm
  };
}
