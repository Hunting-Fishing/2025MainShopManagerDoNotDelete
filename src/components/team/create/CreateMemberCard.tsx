
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { TeamMemberForm } from "../form/TeamMemberForm";
import { TeamMember } from "@/types/team";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { getInitials } from "@/data/teamData";

export function CreateMemberCard() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      // First, insert the profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert({
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
          phone: data.phone
        })
        .select('id')
        .single();

      if (profileError) {
        throw profileError;
      }

      // Get the role ID for the selected role
      const { data: roleData, error: roleError } = await supabase
        .from('roles')
        .select('id')
        .eq('name', data.role.toLowerCase())
        .single();

      if (roleError) {
        // Try a case-insensitive search if exact match fails
        const { data: roleDataCaseInsensitive, error: roleErrorCaseInsensitive } = await supabase
          .from('roles')
          .select('id')
          .ilike('name', data.role)
          .single();

        if (roleErrorCaseInsensitive) {
          throw new Error(`Role "${data.role}" not found. Please select a valid role.`);
        }

        // Use the case-insensitive match
        roleData = roleDataCaseInsensitive;
      }

      // Assign the role to the user
      const { error: roleAssignError } = await supabase
        .from('user_roles')
        .insert({
          user_id: profileData.id,
          role_id: roleData.id
        });

      if (roleAssignError) {
        throw roleAssignError;
      }

      toast({
        title: "Team member created",
        description: `${data.firstName} ${data.lastName} has been added to the team`,
        variant: "success",
      });

      // Navigate back to team list
      navigate('/team');
    } catch (error: any) {
      console.error('Error creating team member:', error);
      toast({
        title: "Failed to create team member",
        description: error.message || "An error occurred while creating the team member",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border border-slate-200 shadow-sm">
      <CardContent className="p-6">
        <TeamMemberForm 
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </CardContent>
    </Card>
  );
}
