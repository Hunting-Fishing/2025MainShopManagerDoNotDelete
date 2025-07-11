import { supabase } from '@/integrations/supabase/client';
import type { MaintenanceSchedule, MaintenanceHistoryItem, MaintenanceStatistics } from '@/types/maintenance';

export { maintenanceService };

// Export convenience functions
export const getMaintenanceSchedules = () => maintenanceService.getMaintenanceSchedules();
export const getMaintenanceHistory = async (): Promise<MaintenanceHistoryItem[]> => {
  return [
    {
      id: '1',
      equipmentId: 'eq1',
      equipmentName: 'Hydraulic Lift #1',
      type: 'Scheduled Maintenance',
      date: new Date().toISOString().split('T')[0],
      status: 'completed',
      performedBy: 'John Doe',
      notes: 'Regular maintenance completed',
      cost: 150,
      partsReplaced: ['Hydraulic fluid', 'Filter'],
      nextDueDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }
  ];
};

export interface MaintenanceScheduleDB {
  id: string;
  vehicle_id?: string;
  equipment_id?: string;
  customer_id?: string;
  maintenance_type: string;
  title: string;
  description?: string;
  frequency_type: 'mileage' | 'time' | 'hours' | 'cycles';
  frequency_interval: number;
  frequency_unit: string;
  last_maintenance_date?: string;
  next_due_date: string;
  mileage_interval?: number;
  current_mileage?: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'active' | 'completed' | 'overdue' | 'paused';
  estimated_cost?: number;
  assigned_technician_id?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export const maintenanceService = {
  // Get all maintenance schedules
  async getMaintenanceSchedules(): Promise<MaintenanceSchedule[]> {
    const { data, error } = await supabase
      .from('maintenance_schedules')
      .select(`
        *,
        vehicles!vehicle_id(year, make, model, license_plate),
        equipment!equipment_id(name, model),
        customers!customer_id(first_name, last_name)
      `)
      .order('next_due_date', { ascending: true });

    if (error) {
      console.error('Error fetching maintenance schedules:', error);
      throw error;
    }

    return (data as MaintenanceSchedule[]) || [];
  },

  // Get overdue maintenance
  async getOverdueMaintenance(): Promise<MaintenanceSchedule[]> {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('maintenance_schedules')
      .select('*')
      .lt('next_due_date', today)
      .eq('status', 'active')
      .order('next_due_date', { ascending: true });

    if (error) {
      console.error('Error fetching overdue maintenance:', error);
      throw error;
    }

    return (data as MaintenanceSchedule[]) || [];
  },

  // Get upcoming maintenance (next 30 days)
  async getUpcomingMaintenance(): Promise<MaintenanceSchedule[]> {
    const today = new Date();
    const thirtyDaysFromNow = new Date(today);
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    const { data, error } = await supabase
      .from('maintenance_schedules')
      .select('*')
      .gte('next_due_date', today.toISOString().split('T')[0])
      .lte('next_due_date', thirtyDaysFromNow.toISOString().split('T')[0])
      .eq('status', 'active')
      .order('next_due_date', { ascending: true });

    if (error) {
      console.error('Error fetching upcoming maintenance:', error);
      throw error;
    }

    return (data as MaintenanceSchedule[]) || [];
  },

  // Get maintenance by vehicle
  async getMaintenanceByVehicle(vehicleId: string): Promise<MaintenanceSchedule[]> {
    const { data, error } = await supabase
      .from('maintenance_schedules')
      .select('*')
      .eq('vehicle_id', vehicleId)
      .order('next_due_date', { ascending: true });

    if (error) {
      console.error('Error fetching maintenance by vehicle:', error);
      throw error;
    }

    return (data as MaintenanceSchedule[]) || [];
  },

  // Get maintenance by customer
  async getMaintenanceByCustomer(customerId: string): Promise<MaintenanceSchedule[]> {
    const { data, error } = await supabase
      .from('maintenance_schedules')
      .select('*')
      .eq('customer_id', customerId)
      .order('next_due_date', { ascending: true });

    if (error) {
      console.error('Error fetching maintenance by customer:', error);
      throw error;
    }

    return (data as MaintenanceSchedule[]) || [];
  },

  // Create new maintenance schedule
  async createMaintenanceSchedule(schedule: Omit<MaintenanceSchedule, 'id' | 'created_at' | 'updated_at'>): Promise<MaintenanceSchedule> {
    const { data, error } = await supabase
      .from('maintenance_schedules')
      .insert(schedule)
      .select()
      .single();

    if (error) {
      console.error('Error creating maintenance schedule:', error);
      throw error;
    }

    return data as MaintenanceSchedule;
  },

  // Update maintenance schedule
  async updateMaintenanceSchedule(id: string, updates: Partial<MaintenanceSchedule>): Promise<MaintenanceSchedule> {
    const { data, error } = await supabase
      .from('maintenance_schedules')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating maintenance schedule:', error);
      throw error;
    }

    return data as MaintenanceSchedule;
  },

  // Delete maintenance schedule
  async deleteMaintenanceSchedule(id: string): Promise<void> {
    const { error } = await supabase
      .from('maintenance_schedules')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting maintenance schedule:', error);
      throw error;
    }
  },

  // Complete maintenance and schedule next
  async completeMaintenance(id: string, actualCost?: number): Promise<MaintenanceSchedule> {
    const schedule = await this.getMaintenanceSchedule(id);
    if (!schedule) {
      throw new Error('Maintenance schedule not found');
    }

    // Calculate next due date based on frequency
    const nextDueDate = this.calculateNextDueDate(schedule);

    return this.updateMaintenanceSchedule(id, {
      last_maintenance_date: new Date().toISOString().split('T')[0],
      next_due_date: nextDueDate,
      status: 'active' // Reset to active for next cycle
    });
  },

  // Get single maintenance schedule
  async getMaintenanceSchedule(id: string): Promise<MaintenanceSchedule | null> {
    const { data, error } = await supabase
      .from('maintenance_schedules')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching maintenance schedule:', error);
      return null;
    }

    return data as MaintenanceSchedule;
  },

  // Calculate next due date based on frequency
  calculateNextDueDate(schedule: MaintenanceSchedule): string {
    const baseDate = schedule.last_maintenance_date 
      ? new Date(schedule.last_maintenance_date)
      : new Date(schedule.next_due_date);

    const nextDate = new Date(baseDate);

    switch (schedule.frequency_type) {
      case 'time':
        if (schedule.frequency_unit === 'days') {
          nextDate.setDate(baseDate.getDate() + schedule.frequency_interval);
        } else if (schedule.frequency_unit === 'weeks') {
          nextDate.setDate(baseDate.getDate() + (schedule.frequency_interval * 7));
        } else if (schedule.frequency_unit === 'months') {
          nextDate.setMonth(baseDate.getMonth() + schedule.frequency_interval);
        } else if (schedule.frequency_unit === 'years') {
          nextDate.setFullYear(baseDate.getFullYear() + schedule.frequency_interval);
        }
        break;
      case 'mileage':
      case 'hours':
      case 'cycles':
        // For these types, we typically need external input to determine next due date
        // For now, default to 30 days from now
        nextDate.setDate(baseDate.getDate() + 30);
        break;
    }

    return nextDate.toISOString().split('T')[0];
  },

  // Get maintenance statistics
  async getMaintenanceStats(): Promise<{
    totalSchedules: number;
    activeSchedules: number;
    overdueSchedules: number;
    upcomingSchedules: number;
    completedThisMonth: number;
    averageCost: number;
  }> {
    const allSchedules = await this.getMaintenanceSchedules();
    const overdueSchedules = await this.getOverdueMaintenance();
    const upcomingSchedules = await this.getUpcomingMaintenance();

    const today = new Date();
    const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const completedThisMonth = allSchedules.filter(schedule => 
      schedule.status === 'completed' && 
      schedule.last_maintenance_date && 
      new Date(schedule.last_maintenance_date) >= firstOfMonth
    ).length;

    const schedulesWithCost = allSchedules.filter(s => s.estimated_cost);
    const averageCost = schedulesWithCost.length > 0
      ? schedulesWithCost.reduce((sum, s) => sum + (s.estimated_cost || 0), 0) / schedulesWithCost.length
      : 0;

    return {
      totalSchedules: allSchedules.length,
      activeSchedules: allSchedules.filter(s => s.status === 'active').length,
      overdueSchedules: overdueSchedules.length,
      upcomingSchedules: upcomingSchedules.length,
      completedThisMonth,
      averageCost
    };
  }
};