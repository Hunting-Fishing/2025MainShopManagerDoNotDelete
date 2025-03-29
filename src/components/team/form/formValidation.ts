
import * as z from "zod";

// Form validation schema
export const teamMemberFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  phone: z.string().min(10, {
    message: "Please enter a valid phone number.",
  }),
  jobTitle: z.string().min(2, {
    message: "Job title must be at least 2 characters.",
  }),
  role: z.string({
    required_error: "Please select a role.",
  }),
  department: z.string({
    required_error: "Please select a department.",
  }),
  status: z.boolean().default(true),
  notes: z.string().optional(),
});

export type TeamMemberFormValues = z.infer<typeof teamMemberFormSchema>;
