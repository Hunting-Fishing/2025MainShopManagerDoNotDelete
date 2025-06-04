
export interface ServiceJob {
  id: string;
  name: string;
  description?: string;
  estimatedTime?: number; // in minutes
  price?: number;
  subcategory_id: string;
  category_id: string;
  base_price: number;
  estimated_duration: number;
  skill_level: string;
  display_order: number;
  is_active: boolean;
}

export interface ServiceSubcategory {
  id: string;
  name: string;
  description?: string;
  jobs: ServiceJob[];
  category_id: string;
  display_order: number;
}

export interface ServiceMainCategory {
  id: string;
  name: string;
  description?: string;
  subcategories: ServiceSubcategory[];
  display_order: number;
  is_active: boolean;
}

export interface ServiceHierarchyState {
  categories: ServiceMainCategory[];
  isLoading: boolean;
  error: string | null;
}
