

export interface ServiceJob {
  id: string;
  name: string;
  description?: string;
  estimatedTime?: number; // in minutes - keeping for backward compatibility
  price?: number; // keeping for backward compatibility
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
  position?: number; // keeping for backward compatibility
}

export interface ServiceHierarchyState {
  categories: ServiceMainCategory[];
  isLoading: boolean;
  error: string | null;
}

