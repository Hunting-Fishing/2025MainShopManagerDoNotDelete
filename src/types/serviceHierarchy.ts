
export interface ServiceJob {
  id: string;
  name: string;
  description?: string;
  estimatedTime?: number; // in minutes
  price?: number;
}

export interface ServiceSubcategory {
  id: string;
  name: string;
  description?: string;
  jobs: ServiceJob[];
}

export interface ServiceMainCategory {
  id: string;
  name: string;
  description?: string;
  subcategories: ServiceSubcategory[];
  position?: number; // Added position field
}

export interface ServiceHierarchyState {
  categories: ServiceMainCategory[];
  isLoading: boolean;
  error: string | null;
}
