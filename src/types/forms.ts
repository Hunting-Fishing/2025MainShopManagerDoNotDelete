
export interface FormTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  is_published?: boolean;
  version?: number;
  created_at?: string;
  updated_at?: string;
  sections: FormSection[];
}

export interface FormSection {
  id: string;
  title: string;
  description: string;
  displayOrder: number;
  fields: FormField[];
}

export interface FormField {
  id: string;
  label: string;
  type: string;
  fieldType?: string;
  required: boolean;
  placeholder?: string;
  displayOrder: number;
  helpText?: string;
  defaultValue?: string;
  validationRules?: {
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: string;
  };
  options?: FormFieldOption[];
}

export interface FormFieldOption {
  id: string;
  label: string;
  value: string;
}
