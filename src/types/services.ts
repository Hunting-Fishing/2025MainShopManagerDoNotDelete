
export interface ServiceItem {
  name: string;
  services: string[];
  category?: string;
  price?: number;
  quantity?: number;
}

export interface ServiceCategory {
  name: string;
  subcategories: ServiceItem[];
}

// Adding these types for better type safety in HierarchicalServiceSelector
export interface ServiceMainCategory {
  name: string;
  subcategories: ServiceSubcategory[];
}

export interface ServiceSubcategory {
  name: string;
  services: string[];
}
