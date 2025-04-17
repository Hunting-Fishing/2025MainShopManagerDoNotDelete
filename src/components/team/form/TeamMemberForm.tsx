
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { TeamMemberFormValues, teamMemberFormSchema } from './formValidation';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { availableRoles, availableDepartments } from './formConstants';
import { Loader2 } from 'lucide-react';
import { JobInfoFields } from './JobInfoFields';
import { PersonalInfoFields } from './PersonalInfoFields';
import { StatusToggleField } from './StatusToggleField';
import { NotesField } from './NotesField';
import { FormActions } from './FormActions';
import { detectRoleFromJobTitle } from '@/utils/roleUtils';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WorkScheduleFields } from './WorkScheduleFields';
import { CertificationsSkillsFields } from './CertificationsSkillsFields';
import { EmploymentDetailsFields } from './EmploymentDetailsFields';
import { LocationAssignmentFields } from './LocationAssignmentFields';
import { SystemAccessFields } from './SystemAccessFields';
import { PayrollInfoFields } from './PayrollInfoFields';
import { EmergencyContactFields } from './EmergencyContactFields';

interface TeamMemberFormProps {
  onSubmit: (data: TeamMemberFormValues) => void;
  isSubmitting?: boolean;
  initialData?: Partial<TeamMemberFormValues>;
  mode?: 'create' | 'edit';
}

export function TeamMemberForm({ onSubmit, isSubmitting = false, initialData, mode = 'create' }: TeamMemberFormProps) {
  const [autoDetectedRole, setAutoDetectedRole] = useState<string | null>(null);
  const [showRoleAlert, setShowRoleAlert] = useState(false);

  const form = useForm<TeamMemberFormValues>({
    resolver: zodResolver(teamMemberFormSchema),
    defaultValues: {
      firstName: initialData?.firstName || '',
      lastName: initialData?.lastName || '',
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      jobTitle: initialData?.jobTitle || '',
      role: initialData?.role || 'Technician',
      department: initialData?.department || 'Field Service',
      status: initialData?.status ?? true,
      notes: initialData?.notes || '',
      // New fields
      work_days: initialData?.work_days || [],
      shift_start: initialData?.shift_start || '',
      shift_end: initialData?.shift_end || '',
      on_call_after_hours: initialData?.on_call_after_hours || false,
      start_date: initialData?.start_date || '',
      employment_type: initialData?.employment_type || '',
      employee_id: initialData?.employee_id || '',
      supervisor_id: initialData?.supervisor_id || '',
      primary_location: initialData?.primary_location || '',
      work_at_other_locations: initialData?.work_at_other_locations || false,
      admin_privileges: initialData?.admin_privileges || false,
      access_financials: initialData?.access_financials || false,
      can_create_work_orders: initialData?.can_create_work_orders || false,
      can_close_jobs: initialData?.can_close_jobs || false,
      pay_rate: initialData?.pay_rate,
      pay_type: initialData?.pay_type || '',
      banking_info_on_file: initialData?.banking_info_on_file || false,
      tax_form_submitted: initialData?.tax_form_submitted || false,
      emergency_contact: initialData?.emergency_contact || {
        contact_name: '',
        phone: '',
        relationship: ''
      },
      certifications: initialData?.certifications || [],
      skills: initialData?.skills || []
    },
  });

  const jobTitle = form.watch('jobTitle');
  const role = form.watch('role');
  
  if (jobTitle && !role && mode === 'create') {
    const detectedRole = detectRoleFromJobTitle(jobTitle);
    if (detectedRole && detectedRole !== autoDetectedRole) {
      setAutoDetectedRole(detectedRole);
      setShowRoleAlert(true);
    }
  }

  const handleApplyDetectedRole = () => {
    if (autoDetectedRole) {
      form.setValue('role', autoDetectedRole);
      setShowRoleAlert(false);
    }
  };

  const handleSubmit = (data: TeamMemberFormValues) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {showRoleAlert && autoDetectedRole && (
          <Alert className="bg-blue-50 border-blue-200">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="flex justify-between items-center">
              <span>
                Based on the job title, we recommend the role: <strong>{autoDetectedRole}</strong>
              </span>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={handleApplyDetectedRole}
              >
                Apply Role
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="basic">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="employment">Employment</TabsTrigger>
            <TabsTrigger value="skills">Qualifications</TabsTrigger>
            <TabsTrigger value="access">Access & HR</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <h3 className="text-lg font-medium">Personal Information</h3>
                <PersonalInfoFields control={form.control} />
              </div>
              
              <div className="space-y-6">
                <h3 className="text-lg font-medium">Work Information</h3>
                <JobInfoFields 
                  control={form.control}
                  availableRoles={availableRoles}
                  availableDepartments={availableDepartments}
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <StatusToggleField control={form.control} />
              <NotesField control={form.control} />
            </div>
          </TabsContent>
          
          <TabsContent value="employment" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <h3 className="text-lg font-medium">Work Schedule</h3>
                <WorkScheduleFields control={form.control} />
              </div>
              
              <div className="space-y-6">
                <h3 className="text-lg font-medium">Employment Details</h3>
                <EmploymentDetailsFields control={form.control} />
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Location Assignment</h3>
              <LocationAssignmentFields control={form.control} />
            </div>
          </TabsContent>
          
          <TabsContent value="skills" className="space-y-6">
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Certifications & Skills</h3>
              <CertificationsSkillsFields control={form.control} />
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Emergency Contact</h3>
              <EmergencyContactFields control={form.control} />
            </div>
          </TabsContent>
          
          <TabsContent value="access" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <h3 className="text-lg font-medium">System Access & Permissions</h3>
                <SystemAccessFields 
                  control={form.control} 
                  teamMemberId={initialData?.id}
                />
              </div>
              
              <div className="space-y-6">
                <h3 className="text-lg font-medium">HR / Payroll Info</h3>
                <PayrollInfoFields control={form.control} />
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <FormActions isSubmitting={isSubmitting} mode={mode} />
      </form>
    </Form>
  );
}
