
import { CustomerEntity } from '../entities/Customer';

export interface CustomerFilters {
  search?: string;
  hasVehicles?: 'yes' | 'no' | '';
  vehicleType?: string;
  tags?: string[];
  dateRange?: {
    from: Date | null;
    to: Date | null;
  };
}

export interface CustomerRepository {
  getAll(): Promise<CustomerEntity[]>;
  getById(id: string): Promise<CustomerEntity | null>;
  search(query: string): Promise<CustomerEntity[]>;
  filter(filters: CustomerFilters): Promise<CustomerEntity[]>;
  create(customer: Omit<CustomerEntity, 'id' | 'created_at' | 'updated_at' | 'fullName' | 'vehicleCount' | 'hasVehicles' | 'isFleetCustomer' | 'matchesSearch'>): Promise<CustomerEntity>;
  update(id: string, customer: Partial<CustomerEntity>): Promise<CustomerEntity>;
  delete(id: string): Promise<void>;
}
