
import { TeamMember } from "@/types/team";
import { TeamMemberCard } from "./TeamMemberCard";

interface TeamMemberGridProps {
  members: TeamMember[];
  getInitials: (name: string) => string;
}

export function TeamMemberGrid({ members, getInitials }: TeamMemberGridProps) {
  console.log("Grid received members:", members.length);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {members.map((member) => (
        <TeamMemberCard 
          key={member.id} 
          member={member} 
          getInitials={getInitials}
        />
      ))}
      {members.length === 0 && (
        <div className="col-span-3 p-8 text-center text-slate-500 bg-white rounded-lg border border-slate-200">
          No team members found matching your filters.
        </div>
      )}
    </div>
  );
}
