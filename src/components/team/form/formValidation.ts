
import { z } from "zod";

export const teamMemberFormSchema = z.object({
  id: z.string().optional(), // Add the id field for existing members
  firstName: z.string().min(2, { message: "First name must be at least 2 characters." }),
  lastName: z.string().min(1, { message: "Last name must be at least 1 character." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z.string().optional(),
  jobTitle: z.string().min(1, { message: "Please select a job title." }),
  role: z.string().min(1, { message: "Please select a role." }),
  department: z.string().min(1, { message: "Please select a department." }),
  status: z.boolean().default(true),
  notes: z.string().optional(),
  
  // Work Schedule
  work_days: z.array(z.string()).optional().default([]),
  shift_start: z.string().optional(),
  shift_end: z.string().optional(),
  on_call_after_hours: z.boolean().optional().default(false),
  
  // Employment Details
  start_date: z.string().optional(),
  employment_type: z.string().optional(),
  employee_id: z.string().optional(),
  supervisor_id: z.string().optional(),
  
  // Location Assignment
  primary_location: z.string().optional(),
  work_at_other_locations: z.boolean().optional().default(false),
  
  // System Access & Permissions
  admin_privileges: z.boolean().optional().default(false),
  access_financials: z.boolean().optional().default(false),
  can_create_work_orders: z.boolean().optional().default(false),
  can_close_jobs: z.boolean().optional().default(false),
  
  // HR / Payroll Info
  pay_rate: z.number().optional(),
  pay_type: z.string().optional(),
  banking_info_on_file: z.boolean().optional().default(false),
  tax_form_submitted: z.boolean().optional().default(false),
  
  // Related data handled through separate forms
  emergency_contact: z.object({
    contact_name: z.string().optional(),
    phone: z.string().optional(),
    relationship: z.string().optional()
  }).optional(),
  
  certifications: z.array(
    z.object({
      certification_name: z.string(),
      issue_date: z.string().optional(),
      expiry_date: z.string().optional()
    })
  ).optional().default([]),
  
  skills: z.array(z.string()).optional().default([])
});

export type TeamMemberFormValues = z.infer<typeof teamMemberFormSchema>;
