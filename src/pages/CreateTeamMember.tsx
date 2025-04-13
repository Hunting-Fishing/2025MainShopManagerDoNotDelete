
import React, { useState } from 'react';
import { Helmet } from "react-helmet-async";
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { TeamMemberForm } from "@/components/team/form/TeamMemberForm";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { TeamMemberFormValues } from "@/components/team/form/formValidation";
import { mapRoleToDbValue } from "@/utils/roleUtils";

export default function CreateTeamMember() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: TeamMemberFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Generate a UUID for new profiles
      const newProfileId = crypto.randomUUID();
      
      // Create or update the profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: newProfileId,
          email: data.email,
          first_name: data.firstName,
          last_name: data.lastName,
          phone: data.phone || null,
          job_title: data.jobTitle,
          department: data.department
        }, { 
          onConflict: 'email',
          ignoreDuplicates: false
        })
        .select('id, email')
        .single();

      if (profileError) {
        throw profileError;
      }

      if (!profileData) {
        throw new Error('Failed to create team member profile');
      }
      
      // Get the database role name from the display role name
      const dbRoleName = mapRoleToDbValue(data.role);
      console.log(`Role mapping: ${data.role} -> ${dbRoleName}`);
      
      // Find the role ID for the selected role
      const { data: roleData, error: roleError } = await supabase
        .from('roles')
        .select('id')
        .eq('name', dbRoleName)
        .single();
      
      if (roleError) {
        console.warn(`Role not found for ${data.role} (${dbRoleName}):`, roleError);
      } else if (roleData) {
        // Assign the role to the user
        const { error: roleAssignError } = await supabase
          .from('user_roles')
          .insert({
            user_id: profileData.id,
            role_id: roleData.id
          });

        if (roleAssignError) {
          console.error('Error assigning role:', roleAssignError);
        }
      }

      // Save profile metadata if notes are provided
      if (data.notes) {
        const { error: metadataError } = await supabase
          .from('profile_metadata')
          .insert({
            profile_id: profileData.id,
            metadata: { notes: data.notes }
          });
          
        if (metadataError) {
          console.warn('Error saving profile metadata:', metadataError);
        }
      }
      
      // Show success message
      toast({
        title: "Team member created",
        description: `${data.firstName} ${data.lastName} has been added to your team.`,
        variant: "success",
      });
      
      // Redirect to team page
      navigate('/team');
      
    } catch (error: any) {
      console.error('Error creating team member:', error);
      
      toast({
        title: "Error creating team member",
        description: error.message || "There was a problem creating the team member. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="container mx-auto p-6">
      <Helmet>
        <title>Create Team Member</title>
        <meta name="description" content="Add a new team member to your organization" />
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
          Fill out the form below to invite a new team member. They will receive an email invitation to join your organization.
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
