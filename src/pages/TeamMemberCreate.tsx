
import { SeoHead } from "@/components/common/SeoHead";
import { CreatePageHeader } from "@/components/team/create/CreatePageHeader";
import { TeamMemberForm } from "@/components/team/form/TeamMemberForm";

export default function TeamMemberCreate() {
  return (
    <div className="space-y-6">
      <SeoHead
        title="Add Team Member | Easy Shop Manager"
        description="Add a new team member to your organization and assign their role and permissions."
        keywords="team management, add team member, role assignment"
      />
      
      <CreatePageHeader />
      
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6">
          <TeamMemberForm />
        </div>
      </div>
    </div>
  );
}
