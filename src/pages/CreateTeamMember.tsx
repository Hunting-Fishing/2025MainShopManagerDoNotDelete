
import React, { useState } from 'react';
import { Helmet } from "react-helmet-async";
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { TeamMemberForm } from "@/components/team/form/TeamMemberForm";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { TeamMemberFormValues } from "@/components/team/form/formValidation";
import { handleApiError } from "@/utils/errorHandling";

export default function CreateTeamMember() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: TeamMemberFormValues) => {
    setIsSubmitting(true);
    
    try {
      console.log("Creating team member with data:", {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        jobTitle: data.jobTitle,
        department: data.department
      });
      
      // Process the skills to extract skill names and proficiency levels
      const skillsWithProficiency = data.skills?.map(skillEntry => {
        // If the skill contains proficiency data in format "skill|proficiency"
        if (skillEntry.includes('|')) {
          const [skill, proficiency] = skillEntry.split('|');
          return { skill_name: skill, proficiency_level: proficiency || 'expert' };
        }
        return { skill_name: skillEntry, proficiency_level: 'expert' };
      }) || [];
      
      // Create team member record in our team_members table
      const { data: teamMemberData, error: createError } = await supabase
        .from('team_members')
        .insert({
          email: data.email,
          first_name: data.firstName,
          last_name: data.lastName,
          phone: data.phone || null,
          job_title: data.jobTitle,
          department: data.department,
          status: data.status ? 'Active' : 'Inactive',
          notes: data.notes || null,
          // Add new fields
          work_days: data.work_days || [],
          shift_start: data.shift_start || null,
          shift_end: data.shift_end || null,
          on_call_after_hours: data.on_call_after_hours || false,
          start_date: data.start_date || null,
          employment_type: data.employment_type || null,
          employee_id: data.employee_id || null,
          supervisor_id: data.supervisor_id || null,
          primary_location: data.primary_location || null,
          work_at_other_locations: data.work_at_other_locations || false,
          admin_privileges: data.admin_privileges || false,
          access_financials: data.access_financials || false,
          can_create_work_orders: data.can_create_work_orders || false,
          can_close_jobs: data.can_close_jobs || false,
          pay_rate: data.pay_rate || null,
          pay_type: data.pay_type || null,
          banking_info_on_file: data.banking_info_on_file || false,
          tax_form_submitted: data.tax_form_submitted || false
        })
        .select('id, email')
        .single();

      if (createError) {
        // Handle specific errors
        if (createError.code === '23505') {
          throw new Error('A team member with this email already exists.');
        }
        
        console.error("Team member creation error:", createError);
        throw createError;
      }

      if (!teamMemberData) {
        throw new Error('Failed to create team member');
      }

      console.log("Created team member with ID:", teamMemberData.id);

      // Add emergency contact if provided
      if (data.emergency_contact && data.emergency_contact.contact_name && data.emergency_contact.phone) {
        const { error: contactError } = await supabase
          .from('team_member_emergency_contacts')
          .insert({
            team_member_id: teamMemberData.id,
            contact_name: data.emergency_contact.contact_name,
            phone: data.emergency_contact.phone,
            relationship: data.emergency_contact.relationship || 'Other'
          });

        if (contactError) {
          console.error("Error creating emergency contact:", contactError);
          // Continue with the process even if emergency contact creation fails
        }
      }

      // Add certifications if provided
      if (data.certifications && data.certifications.length > 0) {
        const { error: certError } = await supabase
          .from('team_member_certifications')
          .insert(
            data.certifications.map(cert => ({
              team_member_id: teamMemberData.id,
              certification_name: cert.certification_name,
              issue_date: cert.issue_date || null,
              expiry_date: cert.expiry_date || null
            }))
          );

        if (certError) {
          console.error("Error creating certifications:", certError);
          // Continue with the process even if certification creation fails
        }
      }

      // Add skills with proficiency levels
      if (skillsWithProficiency.length > 0) {
        const { error: skillsError } = await supabase
          .from('team_member_skills')
          .insert(
            skillsWithProficiency.map(item => ({
              team_member_id: teamMemberData.id,
              skill_name: item.skill_name,
              proficiency_level: item.proficiency_level
            }))
          );

        if (skillsError) {
          console.error("Error creating skills:", skillsError);
          // Continue with the process even if skills creation fails
        }
      }

      // Find the role ID for the selected role
      const { data: roleData, error: roleError } = await supabase
        .from('roles')
        .select('id')
        .eq('name', data.role.toLowerCase())
        .single();

      if (roleError) {
        console.warn(`Role not found for ${data.role}, will skip role assignment:`, roleError);
      } else if (roleData) {
        // Assign the role to the team member
        const { error: roleAssignError } = await supabase
          .from('team_member_roles')
          .insert({
            team_member_id: teamMemberData.id,
            role_id: roleData.id
          });

        if (roleAssignError) {
          console.error('Error assigning role:', roleAssignError);
          // Continue without throwing, as the team member was created successfully
        }
      }
      
      // Record the team member creation history
      const { data: userData } = await supabase.auth.getUser();
      
      if (userData?.user) {
        // Get the current user's name for the history record
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', userData.user.id)
          .single();
          
        const userName = userProfile 
          ? `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim() 
          : 'System';
          
        await supabase.rpc('record_team_member_history', {
          profile_id_param: teamMemberData.id,
          action_type_param: 'creation',
          action_by_param: userData.user.id,
          action_by_name_param: userName,
          details_param: {
            email: data.email,
            role: data.role,
            timestamp: new Date().toISOString()
          }
        });
      }
      
      // Show success message
      toast({
        title: "Team member created",
        description: `${data.firstName} ${data.lastName} has been added to your team.`,
      });
      
      // Redirect to team page
      navigate('/team');
      
    } catch (error: any) {
      console.error('Error creating team member:', error);
      
      // Use our error handling utility
      handleApiError(error, "Could not create team member. Please check the information and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="container mx-auto p-6">
      <Helmet>
        <title>Create Team Member</title>
        <meta name="description" content="Add a new team member to your organization" />
        <meta name="keywords" content="team management, create team member, add user" />
      </Helmet>
      
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => navigate('/team')}
            aria-label="Go back to team list"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Create Team Member</h1>
        </div>
      </div>

      <Card className="p-6">
        <p className="text-muted-foreground mb-6">
          Fill out the form below to add a new team member to your organization.
        </p>
        
        <TeamMemberForm 
          mode="create" 
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </Card>
    </div>
  );
}
