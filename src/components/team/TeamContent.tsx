
import { TeamMember } from "@/types/team";
import { TeamMemberGrid } from "./TeamMemberGrid";
import { TeamMemberTable } from "./TeamMemberTable";
import { TeamLoading } from "./TeamLoading";
import { TeamEmpty } from "./TeamEmpty";
import { getInitials } from "@/utils/teamUtils";

interface TeamContentProps {
  members: TeamMember[];
  isLoading: boolean;
  view: "grid" | "list";
}

export function TeamContent({ members, isLoading, view }: TeamContentProps) {
  if (isLoading) {
    return <TeamLoading />;
  }

  if (members.length === 0) {
    return <TeamEmpty hasMembers={members.length > 0} />;
  }

  return view === 'grid' ? (
    <TeamMemberGrid 
      members={members} 
      getInitials={getInitials} 
    />
  ) : (
    <TeamMemberTable 
      members={members} 
      getInitials={getInitials} 
    />
  );
}
