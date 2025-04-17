
import { z } from 'zod';

// Define the certification schema
const certificationSchema = z.object({
  certification_name: z.string(),
  issue_date: z.string().optional(),
  expiry_date: z.string().optional(),
});

export type CertificationType = z.infer<typeof certificationSchema>;

// Define the emergency contact schema
const emergencyContactSchema = z.object({
  contact_name: z.string().optional(),
  phone: z.string().optional(),
  relationship: z.string().optional(),
});

// Define the team member form schema
export const teamMemberFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  jobTitle: z.string().min(1, 'Job title is required'),
  role: z.string().min(1, 'Role is required'),
  department: z.string().min(1, 'Department is required'),
  status: z.boolean().default(true),
  notes: z.string().optional(),
  
  // Schedule fields
  work_days: z.array(z.string()).default([]),
  shift_start: z.string().optional(),
  shift_end: z.string().optional(),
  on_call_after_hours: z.boolean().optional(),
  
  // Employment details
  start_date: z.string().optional(),
  employment_type: z.string().optional(),
  employee_id: z.string().optional(),
  supervisor_id: z.string().optional(),
  
  // Location fields
  primary_location: z.string().optional(),
  work_at_other_locations: z.boolean().optional(),
  
  // System access fields
  admin_privileges: z.boolean().optional(),
  access_financials: z.boolean().optional(),
  can_create_work_orders: z.boolean().optional(),
  can_close_jobs: z.boolean().optional(),
  
  // HR/Payroll fields
  pay_rate: z.number().optional(),
  pay_type: z.string().optional(),
  banking_info_on_file: z.boolean().optional(),
  tax_form_submitted: z.boolean().optional(),
  
  // Emergency contact
  emergency_contact: emergencyContactSchema.optional(),
  
  // Skills and certifications
  skills: z.array(z.string()).default([]),
  certifications: z.array(certificationSchema).default([]),

  // Additional field for existing team members
  id: z.string().optional(),
});

// Export the type derived from the schema
export type TeamMemberFormValues = z.infer<typeof teamMemberFormSchema>;
