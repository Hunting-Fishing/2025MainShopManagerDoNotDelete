import { supabase } from '@/lib/supabase';
import { Equipment } from '@/types/equipment';

export interface EquipmentDetails extends Equipment {
  maintenanceRecords: Array<{
    id: string;
    date: string;
    type: string;
    description: string;
    technician: string;
    cost: number;
    nextMaintenanceDate?: string;
  }>;
  currentStatus: 'operational' | 'maintenance' | 'down' | 'repair';
  specifications: Record<string, string>;
  assignedTo?: string;
  type?: string;
  description?: string;
  current_value?: number;
}

export async function getEquipmentById(id: string): Promise<EquipmentDetails | null> {
  try {
    const { data: equipment, error } = await supabase
      .from('equipment_assets')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!equipment) return null;

    // Get maintenance records
    const { data: maintenance } = await supabase
      .from('maintenance_schedules')
      .select('*')
      .eq('equipment_id', id)
      .order('created_at', { ascending: false });

    return {
      ...equipment,
      maintenanceRecords: maintenance?.map(m => ({
        id: m.id,
        date: m.created_at,
        type: m.maintenance_type || 'General',
        description: m.description || '',
        technician: m.assigned_technician_id || 'Unassigned',
        cost: m.estimated_cost || 0,
        nextMaintenanceDate: m.last_maintenance_date
      })) || [],
      currentStatus: (equipment.status === 'retired' ? 'down' : equipment.status) as any,
      specifications: (typeof equipment.specifications === 'object' && equipment.specifications !== null) 
        ? equipment.specifications as Record<string, string>
        : {},
      location: equipment.location || 'Unknown',
      assignedTo: equipment.assigned_to,
      // Add missing fields with defaults
      category: 'General',
      customer: '',
      install_date: '',
      warranty_expiry_date: '',
      warranty_status: 'unknown',
      last_maintenance_date: '',
      next_maintenance_date: '',
      maintenance_frequency: 'as-needed',
      manufacturer: equipment.manufacturer || '',
      model: equipment.model || '',
      name: equipment.name,
      id: equipment.id
    } as unknown as EquipmentDetails;
  } catch (error) {
    console.error('Error fetching equipment details:', error);
    return null;
  }
}

export async function updateEquipmentStatus(id: string, status: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('equipment_assets')
      .update({ status: status as any, updated_at: new Date().toISOString() })
      .eq('id', id);

    return !error;
  } catch (error) {
    console.error('Error updating equipment status:', error);
    return false;
  }
}

export async function getAllEquipment(): Promise<Equipment[]> {
  try {
    const { data, error } = await supabase
      .from('equipment_assets')
      .select('*')
      .order('name');

    if (error) throw error;
    return (data || []) as any;
  } catch (error) {
    console.error('Error fetching equipment list:', error);
    return [];
  }
}