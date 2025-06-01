
export interface SelectedService {
  id: string;
  name: string;
  description?: string;
  categoryName: string;
  subcategoryName: string;
  estimatedTime?: number; // in minutes
  price?: number;
  notes?: string;
  serviceId: string; // reference to original service
}

export interface ServiceSelectionSummary {
  totalServices: number;
  totalEstimatedTime: number; // in minutes
  totalEstimatedCost: number;
}
