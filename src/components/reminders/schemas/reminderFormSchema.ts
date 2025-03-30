
import { z } from "zod";
import { ReminderType } from "@/types/reminder";

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
});

export type ReminderFormValues = z.infer<typeof reminderFormSchema>;
