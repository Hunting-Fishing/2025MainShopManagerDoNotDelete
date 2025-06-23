
import { BaseRepository } from './BaseRepository';
import { supabase } from '@/integrations/supabase/client';

export interface Vehicle {
  id: string;
  customer_id: string;
  year?: number;
  make?: string;
  model?: string;
  vin?: string;
  license_plate?: string;
  color?: string;
  mileage?: number;
  engine_size?: string;
  transmission_type?: string;
  fuel_type?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export class VehicleRepository extends BaseRepository<Vehicle> {
  constructor() {
    super('vehicles');
  }

  async findByCustomer(customerId: string): Promise<Vehicle[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });
    
    if (error) throw this.handleError(error);
    return data || [];
  }

  async findByVin(vin: string): Promise<Vehicle | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('vin', vin)
      .single();
    
    if (error && error.code !== 'PGRST116') throw this.handleError(error);
    return data || null;
  }

  async findByLicensePlate(licensePlate: string): Promise<Vehicle | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('license_plate', licensePlate)
      .single();
    
    if (error && error.code !== 'PGRST116') throw this.handleError(error);
    return data || null;
  }

  async searchVehicles(searchTerm: string): Promise<Vehicle[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .or(`make.ilike.%${searchTerm}%,model.ilike.%${searchTerm}%,vin.ilike.%${searchTerm}%,license_plate.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false });
    
    if (error) throw this.handleError(error);
    return data || [];
  }
}
