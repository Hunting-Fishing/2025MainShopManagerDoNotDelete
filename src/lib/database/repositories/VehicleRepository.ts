
import { supabase } from '@/integrations/supabase/client';
import { PostgrestError } from '@supabase/supabase-js';

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

export interface CreateVehicleInput {
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
}

export interface UpdateVehicleInput {
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
}

export class VehicleRepository {
  async findAll(): Promise<Vehicle[]> {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw this.handleError(error);
    return data || [];
  }

  async findById(id: string): Promise<Vehicle | null> {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') throw this.handleError(error);
    return data || null;
  }

  async findByCustomer(customerId: string): Promise<Vehicle[]> {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });
    
    if (error) throw this.handleError(error);
    return data || [];
  }

  async findByVin(vin: string): Promise<Vehicle | null> {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('vin', vin)
      .single();
    
    if (error && error.code !== 'PGRST116') throw this.handleError(error);
    return data || null;
  }

  async findByLicensePlate(licensePlate: string): Promise<Vehicle | null> {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('license_plate', licensePlate)
      .single();
    
    if (error && error.code !== 'PGRST116') throw this.handleError(error);
    return data || null;
  }

  async create(entity: CreateVehicleInput): Promise<Vehicle> {
    // Ensure all required fields are present for Supabase
    const insertData = {
      customer_id: entity.customer_id,
      year: entity.year || null,
      make: entity.make || null,
      model: entity.model || null,
      vin: entity.vin || null,
      license_plate: entity.license_plate || null,
      color: entity.color || null,
      mileage: entity.mileage || null,
      engine_size: entity.engine_size || null,
      transmission_type: entity.transmission_type || null,
      fuel_type: entity.fuel_type || null,
      notes: entity.notes || null,
    };

    const { data, error } = await supabase
      .from('vehicles')
      .insert(insertData)
      .select()
      .single();
    
    if (error) throw this.handleError(error);
    return data;
  }

  async update(id: string, updates: UpdateVehicleInput): Promise<Vehicle> {
    const { data, error } = await supabase
      .from('vehicles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw this.handleError(error);
    return data;
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('vehicles')
      .delete()
      .eq('id', id);
    
    if (error) throw this.handleError(error);
  }

  async searchVehicles(searchTerm: string): Promise<Vehicle[]> {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .or(`make.ilike.%${searchTerm}%,model.ilike.%${searchTerm}%,vin.ilike.%${searchTerm}%,license_plate.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false });
    
    if (error) throw this.handleError(error);
    return data || [];
  }

  private handleError(error: PostgrestError): Error {
    console.error('Database error in vehicles:', error);
    return new Error(`Vehicle operation failed: ${error.message}`);
  }
}
