
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { TeamMemberFormValues } from '@/components/team/form/formValidation';
import { recordTeamMemberHistory } from '@/utils/teamHistoryUtils';
import { toast } from '@/hooks/use-toast';

export function useTeamMemberUpdate() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateTeamMember = async (
    memberId: string,
    formData: TeamMemberFormValues,
    originalData?: TeamMemberFormValues
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      // Transform form data to match database schema
      const teamMemberData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        job_title: formData.jobTitle,
        department: formData.department,
        status: formData.status ? 'Active' : 'Inactive',
        notes: formData.notes,
        // New fields
        work_days: formData.work_days,
        shift_start: formData.shift_start,
        shift_end: formData.shift_end,
        on_call_after_hours: formData.on_call_after_hours,
        start_date: formData.start_date,
        employment_type: formData.employment_type,
        employee_id: formData.employee_id,
        supervisor_id: formData.supervisor_id,
        primary_location: formData.primary_location,
        work_at_other_locations: formData.work_at_other_locations,
        admin_privileges: formData.admin_privileges,
        access_financials: formData.access_financials,
        can_create_work_orders: formData.can_create_work_orders,
        can_close_jobs: formData.can_close_jobs,
        pay_rate: formData.pay_rate,
        pay_type: formData.pay_type,
        banking_info_on_file: formData.banking_info_on_file,
        tax_form_submitted: formData.tax_form_submitted
      };

      // Update the profile record
      const { error: updateError } = await supabase
        .from('team_members')
        .update(teamMemberData)
        .eq('id', memberId);

      if (updateError) {
        throw updateError;
      }

      // Handle emergency contact if provided
      if (formData.emergency_contact && 
          formData.emergency_contact.contact_name &&
          formData.emergency_contact.phone &&
          formData.emergency_contact.relationship) {
        
        // Check if emergency contact exists
        const { data: existingContact } = await supabase
          .from('team_member_emergency_contacts')
          .select('id')
          .eq('team_member_id', memberId)
          .single();
          
        if (existingContact) {
          // Update existing emergency contact
          await supabase
            .from('team_member_emergency_contacts')
            .update({
              contact_name: formData.emergency_contact.contact_name,
              phone: formData.emergency_contact.phone,
              relationship: formData.emergency_contact.relationship
            })
            .eq('id', existingContact.id);
        } else {
          // Create new emergency contact
          await supabase
            .from('team_member_emergency_contacts')
            .insert({
              team_member_id: memberId,
              contact_name: formData.emergency_contact.contact_name,
              phone: formData.emergency_contact.phone,
              relationship: formData.emergency_contact.relationship
            });
        }
      }

      // Handle certifications
      if (formData.certifications && formData.certifications.length > 0) {
        // Delete existing certifications
        await supabase
          .from('team_member_certifications')
          .delete()
          .eq('team_member_id', memberId);
          
        // Insert new certifications
        await supabase
          .from('team_member_certifications')
          .insert(
            formData.certifications.map(cert => ({
              team_member_id: memberId,
              certification_name: cert.certification_name,
              issue_date: cert.issue_date,
              expiry_date: cert.expiry_date
            }))
          );
      }
      
      // Process skills to separate skill name from proficiency
      const skillsWithProficiency = formData.skills?.map(skillEntry => {
        // If the skill contains proficiency data
        if (skillEntry.includes('|')) {
          const [skill, proficiency] = skillEntry.split('|');
          return { skill_name: skill, proficiency_level: proficiency || 'expert' };
        }
        return { skill_name: skillEntry, proficiency_level: 'expert' };
      }) || [];
      
      // Handle skills with proficiency levels
      if (skillsWithProficiency.length > 0) {
        // Delete existing skills
        await supabase
          .from('team_member_skills')
          .delete()
          .eq('team_member_id', memberId);
          
        // Insert new skills
        await supabase
          .from('team_member_skills')
          .insert(
            skillsWithProficiency.map(item => ({
              team_member_id: memberId,
              skill_name: item.skill_name,
              proficiency_level: item.proficiency_level
            }))
          );
      }

      // Get user info for history record
      const { data: { user } } = await supabase.auth.getUser();
      
      // Get the current user's name from profiles
      const { data: currentUserProfile } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', user?.id)
        .single();

      const currentUserName = currentUserProfile 
        ? `${currentUserProfile.first_name || ''} ${currentUserProfile.last_name || ''}`.trim() 
        : 'Unknown User';

      // Record the profile update in history
      await recordTeamMemberHistory({
        profile_id: memberId,
        action_type: 'profile_update',
        action_by: user?.id || 'unknown',
        action_by_name: currentUserName,
        details: {
          changes: getChanges(originalData, formData),
          timestamp: new Date().toISOString()
        }
      });

      // If the status changed, record that separately
      if (originalData && originalData.status !== formData.status) {
        await recordTeamMemberHistory({
          profile_id: memberId,
          action_type: 'status_change',
          action_by: user?.id || 'unknown',
          action_by_name: currentUserName,
          details: {
            from: originalData.status ? 'Active' : 'Inactive',
            to: formData.status ? 'Active' : 'Inactive',
            timestamp: new Date().toISOString()
          }
        });
      }

      toast({
        title: "Team member updated",
        description: "Team member information has been updated successfully."
      });

      return true;
    } catch (err) {
      console.error('Error updating team member:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);

      toast({
        title: "Update failed",
        description: errorMessage,
        variant: "destructive"
      });

      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to track what changed between original and new data
  const getChanges = (originalData?: TeamMemberFormValues, newData?: TeamMemberFormValues) => {
    if (!originalData || !newData) return {};
    
    const changes: Record<string, { from: any, to: any }> = {};
    
    (Object.keys(newData) as Array<keyof TeamMemberFormValues>).forEach(key => {
      if (originalData[key] !== newData[key]) {
        changes[key] = {
          from: originalData[key],
          to: newData[key]
        };
      }
    });
    
    return changes;
  };

  return { updateTeamMember, isLoading, error };
}
