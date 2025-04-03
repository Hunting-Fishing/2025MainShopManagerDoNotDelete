
import { OverviewTab } from "./tabs/OverviewTab";
import { ActivityTab } from "./tabs/ActivityTab";
import { EditProfileTab } from "./tabs/EditProfileTab";
import { PermissionsTab } from "./tabs/PermissionsTab";
import { TeamMember } from "@/types/team";
import { TeamMemberFormValues } from "../form/formValidation";

interface TeamMemberDetailsProps {
  member: TeamMember;
  activeTab: string;
}

export function TeamMemberDetails({ member, activeTab }: TeamMemberDetailsProps) {
  // Convert member data to form values format
  const memberFormData = {
    id: member.id,  // Include id for database updates
    name: member.name,
    email: member.email,
    phone: member.phone,
    jobTitle: member.jobTitle,
    role: member.role,
    department: member.department,
    status: member.status === "Active",
    notes: member.notes || "",
  };

  return (
    <div className="mt-6">
      {activeTab === "overview" && <OverviewTab member={member} />}
      
      {activeTab === "permissions" && <PermissionsTab member={member} />}
      
      {activeTab === "activity" && <ActivityTab member={member} />}
      
      {activeTab === "edit" && <EditProfileTab initialData={memberFormData} />}
    </div>
  );
}
