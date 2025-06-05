
export interface ServiceJob {
  id: string;
  name: string;
  description?: string;
  estimatedTime?: number; // in minutes
  price?: number;
  subcategory_id?: string; // Added to link jobs to subcategories
}

export interface ServiceSubcategory {
  id: string;
  name: string;
  description?: string;
  jobs: ServiceJob[];
  category_id?: string; // Added to link subcategories to categories
}

export interface ServiceMainCategory {
  id: string;
  name: string;
  description?: string;
  subcategories: ServiceSubcategory[];
  position?: number; // Added position field
  sector_id?: string; // Added to link categories to sectors
}

export interface ServiceSector {
  id: string;
  name: string;
  description?: string;
  categories: ServiceMainCategory[];
  position?: number;
  is_active?: boolean;
}

export interface ServiceHierarchyState {
  sectors: ServiceSector[];
  isLoading: boolean;
  error: string | null;
}
