
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
  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between p-4 border-b border-slate-100">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random`} alt={member.name} />
            <AvatarFallback className="bg-esm-blue-100 text-esm-blue-700">{getInitials(member.name)}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium text-slate-900">{member.name}</h3>
            <p className="text-sm text-slate-500">{member.jobTitle || 'No Job Title'}</p>
          </div>
        </div>
        <Badge variant={member.status === "Active" ? "success" : "destructive"} className="ml-auto">
          {member.status}
        </Badge>
      </div>
      <div className="p-4 space-y-4">
        <div className="flex flex-col gap-2">
          <p className="text-sm text-slate-700 flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-slate-400" />
            <span className="font-medium">Role:</span> {member.role || 'No Role Assigned'}
          </p>
          <p className="text-sm text-slate-700">
            <span className="font-medium">Department:</span> {member.department}
          </p>
          <div className="flex items-center gap-3 text-sm text-slate-700">
            <Mail className="h-4 w-4 text-slate-400" />
            <a href={`mailto:${member.email}`} className="text-esm-blue-600 hover:underline">
              {member.email}
            </a>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-700">
            <Phone className="h-4 w-4 text-slate-400" />
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
      <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between">
        <Link 
          to={`/team/${member.id}`} 
          className="text-sm text-esm-blue-600 hover:text-esm-blue-800 flex items-center gap-1"
        >
          <Eye className="h-4 w-4" />
          View Profile
        </Link>

        <Link
          to={`/team/${member.id}?tab=permissions`}
          className="text-sm text-esm-blue-600 hover:text-esm-blue-800"
        >
          Permissions
        </Link>
      </div>
    </div>
  );
}
