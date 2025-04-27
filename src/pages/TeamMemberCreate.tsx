
import React, { useState } from 'react';
import { Helmet } from "react-helmet-async";
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { TeamMemberForm } from "@/components/team/form/TeamMemberForm";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { TeamMemberFormValues } from "@/components/team/form/formValidation";
import { mapRoleToDbValue, validateRoleValue, AppRoleType } from "@/utils/roleUtils";
import { useShopId } from "@/hooks/useShopId";

export default function CreateTeamMember() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { shopId } = useShopId();

  const handleSubmit = async (data: TeamMemberFormValues) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      console.log("Starting team member creation process");
      
      // Create a profile record for the team member without requiring an auth user
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert({
          email: data.email,
          first_name: data.firstName,
          last_name: data.lastName,
          phone: data.phone || null,
          job_title: data.jobTitle,
          department: data.department,
          shop_id: shopId // Associate with the current shop
        })
        .select('id, email')
        .single();

      if (profileError) {
        console.error("Profile creation error:", profileError);
        throw profileError;
      }

      if (!profileData) {
        console.error("No profile data returned");
        throw new Error('Failed to create team member profile');
      }

      console.log("Profile created successfully:", profileData);
      
      // Get the database role name from the display role name
      const dbRoleName = mapRoleToDbValue(data.role);
      // Convert the string to AppRoleType and validate it
      const validatedRoleName = validateRoleValue(dbRoleName);
      console.log(`Role mapping: ${data.role} -> ${dbRoleName} -> ${validatedRoleName}`);
      
      // Find the role ID for the selected role
      const { data: roleData, error: roleError } = await supabase
        .from('roles')
        .select('id')
        .eq('name', validatedRoleName)
        .single();
      
      if (roleError) {
        console.warn(`Role not found for ${data.role} (${validatedRoleName}):`, roleError);
      } else if (roleData) {
        console.log("Found role:", roleData);
        // Assign the role to the user
        const { error: roleAssignError } = await supabase
          .from('user_roles')
          .insert({
            user_id: profileData.id,
            role_id: roleData.id
          });

        if (roleAssignError) {
          console.error('Error assigning role:', roleAssignError);
        } else {
          console.log("Role assigned successfully");
        }
      }

      // Save profile metadata if notes are provided
      if (data.notes) {
        console.log("Saving profile metadata");
        const { error: metadataError } = await supabase
          .from('profile_metadata')
          .insert({
            profile_id: profileData.id,
            metadata: { 
              notes: data.notes,
              is_active: data.status === true 
            }
          });
          
        if (metadataError) {
          console.warn('Error saving profile metadata:', metadataError);
        } else {
          console.log("Profile metadata saved successfully");
        }
      }
      
      // Record this action in the team member history
      await supabase.rpc('record_team_history', {
        profile_id_param: profileData.id,
        action_type_param: 'created',
        action_by_param: null, // Can be updated if we have current user ID
        action_by_name_param: 'System',
        details_param: { initial_role: data.role }
      });
      
      // Show success message
      toast({
        title: "Team member created",
        description: `${data.firstName} ${data.lastName} has been added to your team.`,
      });
      
      // Redirect to team page
      navigate('/team');
      
    } catch (error: any) {
      console.error('Error creating team member:', error);
      
      setError(error.message || "There was a problem creating the team member. Please try again.");
      
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
    <div className="container mx-auto p-4 md:p-6">
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

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="p-6 shadow-md border border-gray-200">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Add New Team Member</h2>
          <p className="text-muted-foreground">
            Fill out the form below to add a new team member to your organization.
          </p>
        </div>
        
        <TeamMemberForm 
          mode="create" 
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </Card>
    </div>
  );
};
