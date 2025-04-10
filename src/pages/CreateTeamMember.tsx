
import React from 'react';
import { Helmet } from "react-helmet-async";
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { TeamMemberForm } from "@/components/team/form/TeamMemberForm";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

export default function CreateTeamMember() {
  const navigate = useNavigate();
  
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
          Fill out the form below to invite a new team member. They will receive an email invitation to join your organization.
        </p>
        
        <TeamMemberForm mode="create" />
      </Card>
    </div>
  );
}
