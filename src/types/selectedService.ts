
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
  estimatedHours?: number; // Added for job line compatibility
  laborRate?: number; // Added for job line compatibility
}

export interface ServiceSelectionSummary {
  totalServices: number;
  totalEstimatedTime: number; // in minutes
  totalEstimatedCost: number;
}
