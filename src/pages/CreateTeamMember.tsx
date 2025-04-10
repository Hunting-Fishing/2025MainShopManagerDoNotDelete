
import React from 'react';
import { SeoHead } from "@/components/common/SeoHead";

export default function CreateTeamMember() {
  return (
    <div className="container mx-auto p-6">
      <SeoHead
        title="Create Team Member"
        description="Add a new team member to your organization"
        keywords="team management, create team member, add user"
      />
      <h1 className="text-2xl font-bold mb-4">Create Team Member</h1>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-muted-foreground mb-4">
          To add a new team member, you'll need to invite them via email. This feature will be available soon.
        </p>
        
        <div className="flex items-center justify-center p-8 border border-dashed border-slate-200 rounded-lg">
          <span className="text-slate-500">Team member creation form coming soon</span>
        </div>
      </div>
    </div>
  );
}
