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
      .from('equipment')
      .select('*')
      .eq('id', id)
      .single();

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
        date: m.scheduled_date || m.created_at,
        type: m.maintenance_type || 'General',
        description: m.description || '',
        technician: m.assigned_technician || 'Unassigned',
        cost: m.estimated_cost || 0,
        nextMaintenanceDate: m.next_maintenance_date
      })) || [],
      currentStatus: equipment.status || 'operational',
      specifications: equipment.specifications || {},
      location: equipment.location || 'Unknown',
      assignedTo: equipment.assigned_to
    };
  } catch (error) {
    console.error('Error fetching equipment details:', error);
    return null;
  }
}

export async function updateEquipmentStatus(id: string, status: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('equipment')
      .update({ status, updated_at: new Date().toISOString() })
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
      .from('equipment')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching equipment list:', error);
    return [];
  }
}