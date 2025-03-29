
import { CreatePageHeader } from "@/components/team/create/CreatePageHeader";
import { CreateMemberCard } from "@/components/team/create/CreateMemberCard";

export default function TeamMemberCreate() {
  return (
    <div className="space-y-6">
      <CreatePageHeader />
      <CreateMemberCard />
    </div>
  );
}
