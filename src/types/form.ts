
export interface FormCategory {
  id: string;
  name: string;
  description?: string;
  count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface FormField {
  id: string;
  label: string;
  type: string;
  required?: boolean;
  placeholder?: string;
  options?: string[];
  defaultValue?: string;
  helpText?: string;
  validation?: Record<string, unknown>;
}

export interface FormSection {
  id?: string;
  title: string;
  description?: string;
  fields?: FormField[];
}

export interface FormTemplate {
  id: string;
  name: string;
  description?: string;
  category: string;
  content: {
    sections?: FormSection[];
  };
  created_by?: string;
  created_at: string;
  updated_at: string;
  version: number;
  is_published: boolean;
  tags?: string[];
}

// Modified to match the exact structure we're using in FormUploads.tsx
export interface FormUpload {
  id: string;
  filename: string;
  filetype: string;
  filesize: number;
  file_url: string;
  uploaded_by?: string;
  uploaded_at: string;
  form_id?: string;
}

// Additional fix for the formCategoryService error with type casting
export type FormCategoryResponse = FormCategory | ({ error: true } & String);
