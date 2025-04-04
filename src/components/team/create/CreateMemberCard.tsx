
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { TeamMemberFormValues } from "@/components/team/form/formValidation";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { handleApiError } from "@/utils/errorHandling";
import { CreateMemberForm } from "@/components/team/CreateMemberForm";
import { detectRoleFromJobTitle, getRoleDbValue } from "@/utils/roleDetectionUtils";
import { AppRole } from "@/utils/roleUtils";

export function CreateMemberCard() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      // First, insert the profile data - generating UUID on the client side
      const newUserId = crypto.randomUUID();
      
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: newUserId, // Providing the required ID field
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
          phone: data.phone,
          job_title: data.jobTitle,
          department: data.department
        })
        .select();

      if (profileError) {
        throw profileError;
      }

      // Determine role - either from the form or auto-detect from job title
      const roleDisplayName = data.role || (data.jobTitle ? detectRoleFromJobTitle(data.jobTitle) : null);
      let roleAssigned = false;
      
      if (roleDisplayName) {
        try {
          // Convert role display name to database value
          const roleDbValue = getRoleDbValue(roleDisplayName);
          console.log(`Assigning role: ${roleDisplayName} (DB value: ${roleDbValue})`);
          
          // Get the role ID for the selected role
          let { data: roleData, error: roleError } = await supabase
            .from('roles')
            .select('id')
            .eq('name', roleDbValue)
            .single();

          if (roleError) {
            // Try a case-insensitive search if exact match fails
            const { data: roleDataCaseInsensitive, error: roleErrorCaseInsensitive } = await supabase
              .from('roles')
              .select('id')
              .ilike('name', roleDbValue)
              .single();

            if (roleErrorCaseInsensitive) {
              console.warn(`Role "${roleDisplayName}" (${roleDbValue}) not found in database.`);
            } else {
              // Use the case-insensitive match
              roleData = roleDataCaseInsensitive;
              
              // Assign the role to the user
              const { error: roleAssignError } = await supabase
                .from('user_roles')
                .insert({
                  user_id: newUserId, // Using the generated user ID
                  role_id: roleData.id
                });

              if (roleAssignError) {
                if (roleAssignError.message?.includes('duplicate key value')) {
                  console.log(`Role ${roleDisplayName} already assigned to user - skipping`);
                  roleAssigned = true;
                } else {
                  console.error("Error assigning role:", roleAssignError);
                }
              } else {
                roleAssigned = true;
              }
            }
          } else if (roleData) {
            // Assign the role to the user
            const { error: roleAssignError } = await supabase
              .from('user_roles')
              .insert({
                user_id: newUserId, // Using the generated user ID
                role_id: roleData.id
              });

            if (roleAssignError) {
              if (roleAssignError.message?.includes('duplicate key value')) {
                console.log(`Role ${roleDisplayName} already assigned to user - skipping`);
                roleAssigned = true;
              } else {
                console.error("Error assigning role:", roleAssignError);
              }
            } else {
              roleAssigned = true;
            }
          }
        } catch (roleError) {
          console.error("Error during role assignment:", roleError);
          // Don't throw here, we'll still create the user even if role assignment fails
        }
      }

      // Save additional metadata if provided
      if (data.notes) {
        const { error: metadataError } = await supabase
          .from('profile_metadata')
          .insert({
            profile_id: newUserId,
            metadata: { notes: data.notes }
          });

        if (metadataError) {
          console.error("Error saving profile metadata:", metadataError);
        }
      }

      toast({
        title: "Team member created",
        description: `${data.firstName} ${data.lastName} has been added to the team${roleAssigned ? ` with role: ${roleDisplayName}` : ''}`,
        variant: "default",
      });

      // Navigate back to team list
      navigate('/team');
    } catch (error: any) {
      console.error('Error creating team member:', error);
      handleApiError(error, "An error occurred while creating the team member");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border border-slate-200 shadow-sm">
      <CardContent className="p-6">
        <CreateMemberForm 
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </CardContent>
    </Card>
  );
}
