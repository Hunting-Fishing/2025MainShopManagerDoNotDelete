
import { z } from "zod";

export const teamMemberFormSchema = z.object({
  id: z.string().optional(), // Add the id field for existing members
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z.string().optional(),
  jobTitle: z.string().min(1, { message: "Please select a job title." }),
  role: z.string().min(1, { message: "Please select a role." }),
  department: z.string().min(1, { message: "Please select a department." }),
  status: z.boolean().default(true),
  notes: z.string().optional(),
});

export type TeamMemberFormValues = z.infer<typeof teamMemberFormSchema>;
