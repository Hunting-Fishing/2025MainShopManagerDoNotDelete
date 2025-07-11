
import { Equipment, MaintenanceRecord } from "./equipment";

export interface MaintenanceTask {
  id: string;
  equipment: Equipment;
  scheduledDate: string;
  completedDate?: string;
  technician?: string;
  status: 'scheduled' | 'overdue' | 'completed' | 'in-progress';
  priority: 'low' | 'medium' | 'high';
  description?: string;
}

export interface MaintenanceHistoryItem extends MaintenanceRecord {
  equipmentName: string;
  status: 'scheduled' | 'overdue' | 'completed' | 'in-progress';
  date: string;
  type: string;
}

export interface MaintenanceStatistics {
  totalScheduled: number;
  totalOverdue: number;
  upcomingCount: number;
  completedCount: number;
  completionRate?: number;
  averageCompletionTime?: number;
}

export interface MaintenanceSchedule {
  id: string;
  equipmentId: string;
  nextDate: string;
  frequency: string;
  description: string;
  isRecurring: boolean;
  notificationsEnabled: boolean;
  reminderDays: number;
}

export type MaintenanceFilterStatus = 'all' | 'overdue' | 'scheduled';
export type MaintenanceTimeframe = 'upcoming' | 'all';
