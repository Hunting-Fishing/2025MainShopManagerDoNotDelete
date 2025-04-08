
import { FormField, FormSection } from './form';

export type FormFieldType = 
  | 'text'
  | 'textarea'
  | 'number'
  | 'select'
  | 'checkbox'
  | 'radio'
  | 'date'
  | 'email'
  | 'phone'
  | 'file';

export interface FormFieldOption {
  label: string;
  value: string;
}

export interface FormFieldValidation {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  min?: number;
  max?: number;
}

export interface FormBuilderField {
  id: string;
  sectionId: string;
  label: string;
  fieldType: FormFieldType;
  placeholder?: string;
  helpText?: string;
  isRequired: boolean;
  displayOrder: number;
  options?: FormFieldOption[];
  defaultValue?: string;
  validationRules?: FormFieldValidation;
}

export interface FormBuilderSection {
  id: string;
  templateId: string;
  title: string;
  description?: string;
  displayOrder: number;
  fields: FormBuilderField[];
}

export interface FormBuilderTemplate {
  id: string;
  name: string;
  description?: string;
  category: string;
  isPublished: boolean;
  version: number;
  sections: FormBuilderSection[];
}
