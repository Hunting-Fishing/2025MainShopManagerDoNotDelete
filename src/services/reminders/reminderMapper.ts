
import { ServiceReminder, ReminderCategory, CreateReminderParams, ReminderTemplate } from "@/types/reminder";

/**
 * Maps a reminder from database format to frontend format
 */
export const mapReminderFromDb = (dbReminder: any): ServiceReminder => {
  // Extract tags from the nested structure
  const tags = dbReminder.tags?.map((tagRelation: any) => ({
    id: tagRelation.tag_id.id,
    name: tagRelation.tag_id.name,
    color: tagRelation.tag_id.color
  })) || [];
  
  // Map the category data if available
  const category = dbReminder.categories ? {
    id: dbReminder.categories.id,
    name: dbReminder.categories.name,
    color: dbReminder.categories.color || '#808080',
    description: dbReminder.categories.description,
    is_active: dbReminder.categories.is_active
  } : undefined;
  
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
    notes: dbReminder.notes,
    
    // Advanced properties
    priority: dbReminder.priority,
    categoryId: dbReminder.category_id,
    category: category,
    assignedTo: dbReminder.assigned_to,
    templateId: dbReminder.template_id,
    isRecurring: dbReminder.is_recurring,
    recurrenceInterval: dbReminder.recurrence_interval,
    recurrenceUnit: dbReminder.recurrence_unit,
    parentReminderId: dbReminder.parent_reminder_id,
    lastOccurredAt: dbReminder.last_occurred_at,
    nextOccurrenceDate: dbReminder.next_occurrence_date,
    tags: tags
  };
};

/**
 * Maps a reminder from frontend format to database format for creation/update
 */
export const mapReminderToDb = (reminder: CreateReminderParams): Record<string, any> => {
  return {
    customer_id: reminder.customerId,
    vehicle_id: reminder.vehicleId,
    type: reminder.type,
    title: reminder.title,
    description: reminder.description,
    due_date: reminder.dueDate,
    notes: reminder.notes,
    
    // Advanced properties
    priority: reminder.priority || 'medium',
    category_id: reminder.categoryId,
    assigned_to: reminder.assignedTo === 'unassigned' ? null : reminder.assignedTo,
    template_id: reminder.templateId,
    is_recurring: reminder.isRecurring || false,
    recurrence_interval: reminder.recurrenceInterval,
    recurrence_unit: reminder.recurrenceUnit,
    status: 'pending' // Default status for new reminders
  };
};

/**
 * Maps a category from database format to frontend format
 */
export const mapCategoryFromDb = (dbCategory: any): ReminderCategory => {
  return {
    id: dbCategory.id,
    name: dbCategory.name,
    color: dbCategory.color || '#808080',
    description: dbCategory.description,
    is_active: dbCategory.is_active
  };
};

/**
 * Maps a template from database format to frontend format
 */
export const mapTemplateFromDb = (dbTemplate: any): ReminderTemplate => {
  // Map the category data if available
  const category = dbTemplate.categories ? {
    id: dbTemplate.categories.id,
    name: dbTemplate.categories.name,
    color: dbTemplate.categories.color || '#808080',
    description: dbTemplate.categories.description,
    is_active: dbTemplate.categories.is_active
  } : undefined;
  
  return {
    id: dbTemplate.id,
    title: dbTemplate.title,
    description: dbTemplate.description,
    categoryId: dbTemplate.category_id,
    category: category,
    priority: dbTemplate.priority || 'medium',
    defaultDaysUntilDue: dbTemplate.default_days_until_due || 30,
    notificationDaysBefore: dbTemplate.notification_days_before || 3,
    isRecurring: dbTemplate.is_recurring || false,
    recurrenceInterval: dbTemplate.recurrence_interval,
    recurrenceUnit: dbTemplate.recurrence_unit,
    createdBy: dbTemplate.created_by,
    createdAt: dbTemplate.created_at,
    updatedAt: dbTemplate.updated_at
  };
};
