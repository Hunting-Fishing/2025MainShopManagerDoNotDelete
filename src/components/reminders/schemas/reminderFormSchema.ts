
import { z } from "zod";
import { ReminderType, ReminderPriority, RecurrenceUnit, ReminderCategory } from "@/types/reminder";

// Schema for reminder form validation
export const reminderFormSchema = z.object({
  customerId: z.string({
    required_error: "Customer is required",
  }),
  vehicleId: z.string().optional(),
  type: z.enum(["service", "maintenance", "follow_up", "warranty", "other"], {
    required_error: "Reminder type is required",
  }),
  title: z.string().min(3, {
    message: "Title must be at least 3 characters",
  }),
  description: z.string().min(5, {
    message: "Description must be at least 5 characters",
  }),
  dueDate: z.date({
    required_error: "Due date is required",
  }),
  notes: z.string().optional(),
  
  // New advanced properties
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  categoryId: z.string().optional(),
  categories: z.array(z.any()).optional(), // For dropdown options
  assignedTo: z.string().optional(),
  templateId: z.string().optional(),
  isRecurring: z.boolean().default(false),
  recurrenceInterval: z.number().optional(),
  recurrenceUnit: z.enum(["days", "weeks", "months", "years"]).optional(),
  tagIds: z.array(z.string()).optional(),
});

// Add a refine check for recurring reminders
export const reminderFormSchemaWithValidation = reminderFormSchema.refine(
  (data) => {
    if (data.isRecurring) {
      return !!data.recurrenceInterval && !!data.recurrenceUnit;
    }
    return true;
  },
  {
    message: "Recurrence interval and unit are required for recurring reminders",
    path: ["recurrenceInterval"],
  }
);

export type ReminderFormValues = z.infer<typeof reminderFormSchema>;
