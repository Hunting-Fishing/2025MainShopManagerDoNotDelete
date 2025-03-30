
export interface CustomerDocument {
  id: string;
  customer_id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  original_name: string;
  title: string;
  description?: string;
  version: number;
  version_notes?: string;
  tags?: string[];
  category?: string;
  is_shared: boolean;
  uploaded_by: string;
  uploaded_by_name: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentVersion {
  id: string;
  document_id: string;
  version_number: number;
  file_path: string;
  file_size: number;
  version_notes?: string;
  uploaded_by: string;
  uploaded_by_name: string;
  created_at: string;
}

export interface DocumentCategory {
  id: string;
  name: string;
  description?: string;
  shop_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentUploadParams {
  file: File;
  customerId: string;
  title: string;
  description?: string;
  category?: string;
  tags?: string[];
  isShared?: boolean;
  versionNotes?: string;
}

export interface SavedSearch {
  id: string;
  name: string;
  description?: string;
  search_query: Record<string, any>;
  user_id: string;
  is_global: boolean;
  created_at: string;
  updated_at: string;
}
