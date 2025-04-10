
import { TeamMember } from "@/types/team";
import { OverviewTab } from "./tabs/OverviewTab";
import { PermissionsTab } from "./tabs/PermissionsTab";
import { ActivityTab } from "./tabs/ActivityTab";
import { EditProfileTab } from "./tabs/EditProfileTab";
import { HistoryTab } from "./tabs/HistoryTab";

interface TeamMemberDetailsProps {
  member: TeamMember;
  activeTab: string;
}

export function TeamMemberDetails({ member, activeTab }: TeamMemberDetailsProps) {
  console.log("TeamMemberDetails received member:", member);

  // Convert member data to form values format for editing
  const initialFormData = {
    id: member.id,
    name: member.name,
    email: member.email,
    phone: member.phone || '',
    jobTitle: member.jobTitle || '',
    department: member.department || '',
    role: member.role,
    notes: member.notes || ''
  };

  return (
    <div className="pt-6">
      {activeTab === "overview" && <OverviewTab member={member} />}
      
      {activeTab === "permissions" && <PermissionsTab member={member} />}
      
      {activeTab === "activity" && <ActivityTab member={member} />}
      
      {activeTab === "edit" && <EditProfileTab initialData={initialFormData} />}
      
      {activeTab === "history" && <HistoryTab member={member} />}
    </div>
  );
}
