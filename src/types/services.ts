
export interface ServiceItem {
  name: string;
  services: string[];
}

export interface ServiceCategory {
  name: string;
  subcategories: ServiceItem[];
}
