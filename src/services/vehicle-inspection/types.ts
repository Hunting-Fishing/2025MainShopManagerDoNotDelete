
import { VehicleBodyStyle } from '@/types/vehicleBodyStyles';
import { Json } from '@/integrations/supabase/types';

// Re-export the type with the proper 'export type' syntax
export type { VehicleBodyStyle };

export interface DamageArea {
  id: string;
  name: string;
  isDamaged: boolean;
  damageType: string | null;
  notes: string;
}

export interface VehicleInspection {
  id?: string;
  vehicleId: string;
  technicianId: string;
  inspectionDate: Date;
  vehicleBodyStyle: VehicleBodyStyle;
  status: 'draft' | 'completed' | 'pending' | 'approved';
  damageAreas: DamageArea[];
  notes?: string;
}

// Helper functions for type casting between application types and database types
export function convertToDamageAreas(data: Json | null): DamageArea[] {
  if (!data) return [];
  return data as unknown as DamageArea[];
}

export function convertToJson(damageAreas: DamageArea[]): Json {
  return damageAreas as unknown as Json;
}
