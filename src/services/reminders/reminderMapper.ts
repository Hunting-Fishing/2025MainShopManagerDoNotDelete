
import { ServiceReminder } from "@/types/reminder";

// Map database record to ServiceReminder type
export const mapReminderFromDb = (record: any): ServiceReminder => {
  return {
    id: record.id,
    customerId: record.customer_id,
    vehicleId: record.vehicle_id,
    type: record.type,
    title: record.title,
    description: record.description,
    dueDate: record.due_date,
    status: record.status,
    notificationSent: record.notification_sent,
    notificationDate: record.notification_date,
    createdAt: record.created_at,
    createdBy: record.created_by,
    completedAt: record.completed_at,
    completedBy: record.completed_by,
    notes: record.notes,
  };
};

// Map ServiceReminder to database record format
export const mapReminderToDb = (reminder: Partial<ServiceReminder>) => {
  return {
    customer_id: reminder.customerId,
    vehicle_id: reminder.vehicleId,
    type: reminder.type,
    title: reminder.title,
    description: reminder.description,
    due_date: reminder.dueDate,
    status: reminder.status,
    notification_sent: reminder.notificationSent,
    notification_date: reminder.notificationDate,
    created_by: reminder.createdBy,
    completed_at: reminder.completedAt,
    completed_by: reminder.completedBy,
    notes: reminder.notes,
  };
};
