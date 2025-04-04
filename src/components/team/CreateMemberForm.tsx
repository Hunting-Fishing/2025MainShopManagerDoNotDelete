
import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { TeamMemberFormValues, teamMemberFormSchema } from './form/formValidation';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { availableRoles, availableDepartments } from './form/formConstants';
import { Loader2, AlertCircle } from 'lucide-react';
import { JobInfoFields } from './form/JobInfoFields';
import { PersonalInfoFields } from './form/PersonalInfoFields';
import { StatusToggleField } from './form/StatusToggleField';
import { NotesField } from './form/NotesField';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { detectRoleFromJobTitle } from '@/utils/roleDetectionUtils';

interface CreateMemberFormProps {
  onSubmit: (data: TeamMemberFormValues) => void;
  isSubmitting: boolean;
  initialData?: Partial<TeamMemberFormValues>;
}

export function CreateMemberForm({ onSubmit, isSubmitting, initialData }: CreateMemberFormProps) {
  const [autoDetectedRole, setAutoDetectedRole] = useState<string | null>(null);
  const [showRoleAlert, setShowRoleAlert] = useState(false);

  const form = useForm<TeamMemberFormValues>({
    resolver: zodResolver(teamMemberFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      jobTitle: initialData?.jobTitle || '',
      role: initialData?.role || '',
      department: initialData?.department || '',
      status: initialData?.status ?? true,
      notes: initialData?.notes || '',
    },
  });

  // Watch for job title changes to auto-detect role
  const jobTitle = form.watch('jobTitle');
  const role = form.watch('role');
  
  useEffect(() => {
    // Only auto-detect if no role is already selected
    if (jobTitle && !role) {
      const detectedRole = detectRoleFromJobTitle(jobTitle);
      if (detectedRole && detectedRole !== autoDetectedRole) {
        setAutoDetectedRole(detectedRole);
        setShowRoleAlert(true);
        
        // Optional: Automatically set the role (uncomment to enable)
        // form.setValue('role', detectedRole);
      }
    }
  }, [jobTitle, role, autoDetectedRole, form]);

  const handleApplyDetectedRole = () => {
    if (autoDetectedRole) {
      form.setValue('role', autoDetectedRole);
      setShowRoleAlert(false);
    }
  };

  const handleSubmit = (data: TeamMemberFormValues) => {
    // Parse the name into first and last names for the API
    const nameParts = data.name.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ');

    const submitData = {
      ...data,
      firstName,
      lastName
    };

    onSubmit(submitData);
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
          <h3 className="text-lg font-medium">Additional Information</h3>
          <StatusToggleField control={form.control} />
          <NotesField control={form.control} />
        </div>
        
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => window.history.back()}>
            Cancel
          </Button>
          <Button type="submit" className="bg-esm-blue-600 hover:bg-esm-blue-700" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Team Member'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
