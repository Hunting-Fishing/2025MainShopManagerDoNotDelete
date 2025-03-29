
import { useState } from "react";
import { TabsContent } from "@/components/ui/tabs";
import { TeamPermissions } from "@/components/team/TeamPermissions";
import { OverviewTab } from "./tabs/OverviewTab";
import { ActivityTab } from "./tabs/ActivityTab";
import { EditProfileTab } from "./tabs/EditProfileTab";
import { TeamMemberFormValues } from "../form/formValidation";

interface TeamMemberDetailsProps {
  member: any;
  activeTab: string;
}

export function TeamMemberDetails({ member, activeTab }: TeamMemberDetailsProps) {
  // Prepare form initial data
  const formInitialData: TeamMemberFormValues = {
    name: member.name,
    email: member.email,
    phone: member.phone,
    jobTitle: member.jobTitle,
    role: member.role,
    department: member.department,
    status: member.status === "Active",
    notes: member.notes,
  };

  return (
    <>
      <TabsContent value="overview" className="pt-6">
        <OverviewTab member={member} />
      </TabsContent>
      
      <TabsContent value="permissions" className="pt-6">
        <TeamPermissions memberRole={member.role} />
      </TabsContent>
      
      <TabsContent value="activity" className="pt-6">
        <ActivityTab activities={member.recentActivity} />
      </TabsContent>
      
      <TabsContent value="edit" className="pt-6">
        <EditProfileTab initialData={formInitialData} />
      </TabsContent>
    </>
  );
}
