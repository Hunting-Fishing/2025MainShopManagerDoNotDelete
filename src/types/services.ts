
export interface ServiceItem {
  name: string;
  services: string[];
  category?: string;
  price?: number;
}

export interface ServiceCategory {
  name: string;
  subcategories: ServiceItem[];
}
