
import { 
  ServiceReminder, 
  ReminderStatus, 
  ReminderType, 
  ReminderPriority, 
  ReminderCategory,
  ReminderTag,
  RecurrenceUnit,
  ReminderTemplate
} from "@/types/reminder";

// Map database record to ServiceReminder type
export const mapReminderFromDb = (record: any): ServiceReminder => {
  return {
    id: record.id,
    customerId: record.customer_id,
    vehicleId: record.vehicle_id,
    type: record.type as ReminderType,
    title: record.title,
    description: record.description,
    dueDate: record.due_date,
    status: record.status as ReminderStatus,
    notificationSent: record.notification_sent,
    notificationDate: record.notification_date,
    createdAt: record.created_at,
    createdBy: record.created_by,
    completedAt: record.completed_at,
    completedBy: record.completed_by,
    notes: record.notes,
    
    // New advanced properties
    priority: record.priority as ReminderPriority || 'medium',
    categoryId: record.category_id,
    category: record.categories ? mapCategoryFromDb(record.categories) : undefined,
    assignedTo: record.assigned_to,
    assignedToName: record.profiles?.full_name || record.profiles?.first_name,
    templateId: record.template_id,
    isRecurring: record.is_recurring || false,
    recurrenceInterval: record.recurrence_interval,
    recurrenceUnit: record.recurrence_unit as RecurrenceUnit,
    parentReminderId: record.parent_reminder_id,
    lastOccurredAt: record.last_occurred_at,
    nextOccurrenceDate: record.next_occurrence_date,
    tags: record.tags ? record.tags.map(mapTagFromDb) : undefined
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
    
    // New advanced properties
    priority: reminder.priority,
    category_id: reminder.categoryId,
    assigned_to: reminder.assignedTo,
    template_id: reminder.templateId,
    is_recurring: reminder.isRecurring,
    recurrence_interval: reminder.recurrenceInterval,
    recurrence_unit: reminder.recurrenceUnit,
    parent_reminder_id: reminder.parentReminderId,
    last_occurred_at: reminder.lastOccurredAt,
    next_occurrence_date: reminder.nextOccurrenceDate
  };
};

// Map reminder category from DB
export const mapCategoryFromDb = (record: any): ReminderCategory => {
  return {
    id: record.id,
    name: record.name,
    color: record.color || '#9CA3AF',
    description: record.description,
    is_active: record.is_active
  };
};

// Map reminder tag from DB
export const mapTagFromDb = (record: any): ReminderTag => {
  return {
    id: record.id,
    name: record.name,
    color: record.color
  };
};

// Map template from DB
export const mapTemplateFromDb = (record: any): ReminderTemplate => {
  return {
    id: record.id,
    title: record.title,
    description: record.description,
    categoryId: record.category_id,
    category: record.categories ? mapCategoryFromDb(record.categories) : undefined,
    priority: record.priority as ReminderPriority,
    defaultDaysUntilDue: record.default_days_until_due,
    notificationDaysBefore: record.notification_days_before,
    isRecurring: record.is_recurring || false,
    recurrenceInterval: record.recurrence_interval,
    recurrenceUnit: record.recurrence_unit as RecurrenceUnit,
    createdBy: record.created_by,
    createdAt: record.created_at,
    updatedAt: record.updated_at
  };
};

// Map template to DB
export const mapTemplateToDb = (template: Partial<ReminderTemplate>) => {
  return {
    title: template.title,
    description: template.description,
    category_id: template.categoryId,
    priority: template.priority,
    default_days_until_due: template.defaultDaysUntilDue,
    notification_days_before: template.notificationDaysBefore,
    is_recurring: template.isRecurring,
    recurrence_interval: template.recurrenceInterval,
    recurrence_unit: template.recurrenceUnit,
    created_by: template.createdBy
  };
};
