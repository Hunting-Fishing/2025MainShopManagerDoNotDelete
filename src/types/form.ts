export interface FormTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  content: any; // This will store the form configuration/structure
  created_by: string;
  created_at: string;
  updated_at: string;
  version: number;
  is_published: boolean;
  tags?: string[];
}

export interface FormUpload {
  id: string;
  filename: string;
  filetype: string;
  filesize: string;
  file_url: string;
  uploaded_by: string;
  uploaded_at: string;
}

export interface FormCategory {
  id: string;
  name: string;
  description?: string;
  count: number;
  created_at: string;
}

export interface FormField {
  id: string;
  type: 'text' | 'textarea' | 'number' | 'select' | 'checkbox' | 'radio' | 'date' | 'email' | 'phone' | 'file';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[] | { label: string; value: string }[]; // For select, checkbox, radio
  defaultValue?: any;
  helpText?: string;
  validation?: any;
}

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
}

export interface FormSubmission {
  id: string;
  templateId: string;
  submittedBy?: string;
  submittedData: Record<string, any>;
  customerId?: string;
  vehicleId?: string;
  workOrderId?: string;
  createdAt: string;
}
