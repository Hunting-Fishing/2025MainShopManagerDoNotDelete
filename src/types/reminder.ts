
import { Customer } from "./customer";

export type ReminderStatus = "pending" | "sent" | "completed" | "cancelled";
export type ReminderType = "service" | "maintenance" | "follow_up" | "warranty" | "other";

export interface ServiceReminder {
  id: string;
  customerId: string;
  vehicleId?: string;
  type: ReminderType;
  title: string;
  description: string;
  dueDate: string;
  status: ReminderStatus;
  notificationSent: boolean;
  notificationDate?: string;
  createdAt: string;
  createdBy: string;
  completedAt?: string;
  completedBy?: string;
  notes?: string;
}

export interface ReminderWithDetails extends ServiceReminder {
  customer?: Customer;
  vehicle?: {
    id: string;
    make?: string;
    model?: string;
    year?: number;
    vin?: string;
    license_plate?: string;
  };
}

export interface CreateReminderParams {
  customerId: string;
  vehicleId?: string;
  type: ReminderType;
  title: string;
  description: string;
  dueDate: string;
  notes?: string;
}
