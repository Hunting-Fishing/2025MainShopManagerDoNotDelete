
import { Link } from "react-router-dom";
import { Mail, Phone, Eye, Briefcase } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { TeamMember } from "@/types/team";

interface TeamMemberCardProps {
  member: TeamMember;
  getInitials: (name: string) => string;
}

export function TeamMemberCard({ member, getInitials }: TeamMemberCardProps) {
  const hasNoRole = member.role === "No Role Assigned";
  const memberInitials = getInitials(member.name);
  
  return (
    <article className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
      <header className="flex items-center justify-between p-4 border-b border-slate-100">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage 
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random`} 
              alt={`Profile photo of ${member.name}`} 
            />
            <AvatarFallback className="bg-esm-blue-100 text-esm-blue-700" aria-label={`${member.name} initials`}>
              {memberInitials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-medium text-slate-900">{member.name}</h2>
            <p className="text-sm text-slate-500">{member.jobTitle || 'No Job Title'}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {hasNoRole && (
            <Badge variant="outline" className="border-yellow-500 text-yellow-700 bg-yellow-50">
              No Role
            </Badge>
          )}
          <Badge variant={member.status === "Active" ? "success" : "destructive"}>
            {member.status}
          </Badge>
        </div>
      </header>
      <div className="p-4 space-y-4">
        <div className="flex flex-col gap-2">
          <p className="text-sm text-slate-700 flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-slate-400" aria-hidden="true" />
            <span className="font-medium">Role:</span> {member.role}
          </p>
          <p className="text-sm text-slate-700">
            <span className="font-medium">Department:</span> {member.department}
          </p>
          <div className="flex items-center gap-3 text-sm text-slate-700">
            <Mail className="h-4 w-4 text-slate-400" aria-hidden="true" />
            <a href={`mailto:${member.email}`} className="text-esm-blue-600 hover:underline">
              {member.email}
            </a>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-700">
            <Phone className="h-4 w-4 text-slate-400" aria-hidden="true" />
            <a href={`tel:${member.phone}`} className="text-esm-blue-600 hover:underline">
              {member.phone || "Not available"}
            </a>
          </div>
        </div>

        {member.role === "Technician" && (
          <div className="flex gap-4 pt-2 border-t border-slate-100">
            <div className="flex-1 text-center">
              <p className="text-xs text-slate-500">Assigned</p>
              <p className="text-xl font-semibold text-esm-blue-600">{member.workOrders.assigned}</p>
            </div>
            <div className="flex-1 text-center">
              <p className="text-xs text-slate-500">Completed</p>
              <p className="text-xl font-semibold text-esm-blue-600">{member.workOrders.completed}</p>
            </div>
          </div>
        )}
      </div>
      <footer className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between">
        <Link 
          to={`/team/${member.id}`} 
          className="text-sm text-esm-blue-600 hover:text-esm-blue-800 flex items-center gap-1"
          aria-label={`View ${member.name}'s complete profile`}
        >
          <Eye className="h-4 w-4" aria-hidden="true" />
          View Profile
        </Link>

        {!hasNoRole && (
          <Link
            to={`/team/${member.id}?tab=permissions`}
            className="text-sm text-esm-blue-600 hover:text-esm-blue-800"
            aria-label={`Manage ${member.name}'s permissions`}
          >
            Permissions
          </Link>
        )}
      </footer>
    </article>
  );
}
