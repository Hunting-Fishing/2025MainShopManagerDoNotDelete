
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { TeamMemberForm } from "@/components/team/form/TeamMemberForm";
import { TeamMemberFormValues } from "@/components/team/form/formValidation";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";

export default function TeamMemberCreate() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: TeamMemberFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Generate a UUID for new profiles
      const newProfileId = crypto.randomUUID();
      
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

      // Find the role ID for the selected role
      const { data: roleData, error: roleError } = await supabase
        .from('roles')
        .select('id')
        .ilike('name', data.role.toLowerCase())
        .single();

      if (!roleError && roleData) {
        // Assign the role to the user
        await supabase
          .from('user_roles')
          .insert({
            user_id: profileData.id,
            role_id: roleData.id
          });
      }
      
      toast({
        title: "Team member created",
        description: `${data.name} has been added to your team.`,
        variant: "success",
      });
      
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
