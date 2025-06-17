
export interface SelectedService {
  id: string;
  name: string;
  description?: string;
  estimated_hours: number;
  labor_rate: number;
  total_amount: number;
  category: string;
  subcategory: string;
  status: 'pending' | 'in-progress' | 'completed' | 'on-hold';
}
