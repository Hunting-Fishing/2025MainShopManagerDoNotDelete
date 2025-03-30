
import { ServiceReminder } from "@/types/reminder";

// Helper function to map DB reminder to our app type
export function mapReminderFromDb(dbReminder: any): ServiceReminder {
  return {
    id: dbReminder.id,
    customerId: dbReminder.customer_id,
    vehicleId: dbReminder.vehicle_id,
    type: dbReminder.type,
    title: dbReminder.title,
    description: dbReminder.description,
    dueDate: dbReminder.due_date,
    status: dbReminder.status,
    notificationSent: dbReminder.notification_sent,
    notificationDate: dbReminder.notification_date,
    createdAt: dbReminder.created_at,
    createdBy: dbReminder.created_by,
    completedAt: dbReminder.completed_at,
    completedBy: dbReminder.completed_by,
    notes: dbReminder.notes
  };
}

// Helper function to map our app type to DB format
export function mapReminderToDb(reminder: Partial<ServiceReminder>): Record<string, any> {
  const dbReminder: Record<string, any> = {};
  
  if (reminder.customerId !== undefined) dbReminder.customer_id = reminder.customerId;
  if (reminder.vehicleId !== undefined) dbReminder.vehicle_id = reminder.vehicleId;
  if (reminder.type !== undefined) dbReminder.type = reminder.type;
  if (reminder.title !== undefined) dbReminder.title = reminder.title;
  if (reminder.description !== undefined) dbReminder.description = reminder.description;
  if (reminder.dueDate !== undefined) dbReminder.due_date = reminder.dueDate;
  if (reminder.status !== undefined) dbReminder.status = reminder.status;
  if (reminder.notificationSent !== undefined) dbReminder.notification_sent = reminder.notificationSent;
  if (reminder.notificationDate !== undefined) dbReminder.notification_date = reminder.notificationDate;
  if (reminder.createdAt !== undefined) dbReminder.created_at = reminder.createdAt;
  if (reminder.createdBy !== undefined) dbReminder.created_by = reminder.createdBy;
  if (reminder.completedAt !== undefined) dbReminder.completed_at = reminder.completedAt;
  if (reminder.completedBy !== undefined) dbReminder.completed_by = reminder.completedBy;
  if (reminder.notes !== undefined) dbReminder.notes = reminder.notes;
  
  return dbReminder;
}
