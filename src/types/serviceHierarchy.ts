
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
  jobs?: ServiceJob[];
}

export interface ServiceMainCategory {
  id: string;
  name: string;
  description?: string;
  position: number;
  subcategories?: ServiceSubcategory[];
}

export interface CategoryColorStyle {
  bg: string;
  text: string;
  border: string;
}
