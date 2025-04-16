
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
      // Parse the name into first and last names
      const nameParts = data.name.split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ');
      
      console.log("Creating team member with profile data:", {
        firstName,
        lastName,
        email: data.email,
        jobTitle: data.jobTitle,
        department: data.department
      });
      
      // Create profile without specifying an ID (let the database generate one)
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert({
          email: data.email,
          first_name: firstName,
          last_name: lastName,
          phone: data.phone || null,
          job_title: data.jobTitle,
          department: data.department
        })
        .select('id, email')
        .single();

      if (profileError) {
        // Handle specific profile creation errors
        if (profileError.code === '23505') {
          throw new Error('A team member with this email already exists.');
        }
        
        if (profileError.code === '23503') {
          throw new Error('Unable to create team member profile: User authentication record not found.');
        }
        
        console.error("Profile creation error:", profileError);
        throw profileError;
      }

      if (!profileData) {
        throw new Error('Failed to create team member profile');
      }

      console.log("Created profile with ID:", profileData.id);

      // Find the role ID for the selected role
      const { data: roleData, error: roleError } = await supabase
        .from('roles')
        .select('id')
        .eq('name', data.role.toLowerCase())
        .single();

      if (roleError) {
        console.warn(`Role not found for ${data.role}, will skip role assignment:`, roleError);
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
          // Continue without throwing, as the user was created successfully
        }
      }
      
      // Show success message
      toast({
        title: "Team member created",
        description: `${data.name} has been added to your team.`,
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
