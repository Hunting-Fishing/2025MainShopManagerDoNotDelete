
import { ServiceReminder, ReminderCategory, ReminderTemplate, ReminderTag } from "@/types/reminder";

// Map reminder from database representation to application representation
export const mapReminderFromDb = (data: any): ServiceReminder => {
  return {
    id: data.id,
    customerId: data.customer_id,
    vehicleId: data.vehicle_id,
    type: data.type,
    title: data.title,
    description: data.description,
    dueDate: data.due_date,
    status: data.status,
    notificationSent: data.notification_sent,
    notificationDate: data.notification_date,
    createdAt: data.created_at,
    createdBy: data.created_by,
    completedAt: data.completed_at,
    completedBy: data.completed_by,
    notes: data.notes,
    
    // Advanced properties
    priority: data.priority,
    categoryId: data.category_id,
    category: data.categories ? mapCategoryFromDb(data.categories) : undefined,
    assignedTo: data.assigned_to,
    assignedToName: data.profiles ? (data.profiles.full_name || `${data.profiles.first_name || ''} ${data.profiles.last_name || ''}`.trim()) : undefined,
    templateId: data.template_id,
    isRecurring: data.is_recurring,
    recurrenceInterval: data.recurrence_interval,
    recurrenceUnit: data.recurrence_unit,
    parentReminderId: data.parent_reminder_id,
    lastOccurredAt: data.last_occurred_at,
    nextOccurrenceDate: data.next_occurrence_date,
    tags: data.tags || []
  };
};

// Map reminder from application representation to database representation
export const mapReminderToDb = (reminder: Partial<ServiceReminder>): any => {
  const dbReminder: any = {};
  
  if (reminder.customerId !== undefined) dbReminder.customer_id = reminder.customerId;
  if (reminder.vehicleId !== undefined) dbReminder.vehicle_id = reminder.vehicleId;
  if (reminder.type !== undefined) dbReminder.type = reminder.type;
  if (reminder.title !== undefined) dbReminder.title = reminder.title;
  if (reminder.description !== undefined) dbReminder.description = reminder.description;
  if (reminder.dueDate !== undefined) dbReminder.due_date = reminder.dueDate;
  if (reminder.status !== undefined) dbReminder.status = reminder.status;
  if (reminder.notificationSent !== undefined) dbReminder.notification_sent = reminder.notificationSent;
  if (reminder.notes !== undefined) dbReminder.notes = reminder.notes;
  if (reminder.priority !== undefined) dbReminder.priority = reminder.priority;
  if (reminder.categoryId !== undefined) dbReminder.category_id = reminder.categoryId;
  if (reminder.assignedTo !== undefined) dbReminder.assigned_to = reminder.assignedTo;
  if (reminder.isRecurring !== undefined) dbReminder.is_recurring = reminder.isRecurring;
  if (reminder.recurrenceInterval !== undefined) dbReminder.recurrence_interval = reminder.recurrenceInterval;
  if (reminder.recurrenceUnit !== undefined) dbReminder.recurrence_unit = reminder.recurrenceUnit;
  
  return dbReminder;
};

// Map category from database representation to application representation
export const mapCategoryFromDb = (data: any): ReminderCategory => {
  return {
    id: data.id,
    name: data.name,
    color: data.color || '#cccccc',
    description: data.description,
    is_active: data.is_active
  };
};

// Map template from database representation to application representation
export const mapTemplateFromDb = (data: any): ReminderTemplate => {
  return {
    id: data.id,
    title: data.title,
    description: data.description,
    categoryId: data.category_id,
    category: data.categories ? mapCategoryFromDb(data.categories) : undefined,
    priority: data.priority,
    defaultDaysUntilDue: data.default_days_until_due,
    notificationDaysBefore: data.notification_days_before,
    isRecurring: data.is_recurring,
    recurrenceInterval: data.recurrence_interval,
    recurrenceUnit: data.recurrence_unit,
    createdBy: data.created_by,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
};

// Map template from application representation to database representation
export const mapTemplateToDb = (template: Partial<ReminderTemplate>): any => {
  const dbTemplate: any = {};
  
  if (template.title !== undefined) dbTemplate.title = template.title;
  if (template.description !== undefined) dbTemplate.description = template.description;
  if (template.categoryId !== undefined) dbTemplate.category_id = template.categoryId;
  if (template.priority !== undefined) dbTemplate.priority = template.priority;
  if (template.defaultDaysUntilDue !== undefined) dbTemplate.default_days_until_due = template.defaultDaysUntilDue;
  if (template.notificationDaysBefore !== undefined) dbTemplate.notification_days_before = template.notificationDaysBefore;
  if (template.isRecurring !== undefined) dbTemplate.is_recurring = template.isRecurring;
  if (template.recurrenceInterval !== undefined) dbTemplate.recurrence_interval = template.recurrenceInterval;
  if (template.recurrenceUnit !== undefined) dbTemplate.recurrence_unit = template.recurrenceUnit;
  
  return dbTemplate;
};

// Map tag from database representation to application representation
export const mapTagFromDb = (data: any): ReminderTag => {
  return {
    id: data.id,
    name: data.name,
    color: data.color
  };
};
