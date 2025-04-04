
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Phone, User, Briefcase, Building } from "lucide-react";
import { getInitials } from "@/data/teamData";

interface ProfileSidebarProps {
  member: {
    name: string;
    jobTitle: string;
    status: string;
    email: string;
    phone: string;
    role: string;
    department: string;
  };
}

export function ProfileSidebar({ member }: ProfileSidebarProps) {
  return (
    <Card className="md:col-span-1 shadow-sm">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center text-center">
          <Avatar className="h-24 w-24 mb-4">
            <AvatarImage src="" alt={member.name} />
            <AvatarFallback className="bg-esm-blue-100 text-esm-blue-700 text-xl">
              {getInitials(member.name)}
            </AvatarFallback>
          </Avatar>
          
          <h2 className="text-xl font-semibold">{member.name}</h2>
          <p className="text-sm text-slate-500 mb-2">{member.jobTitle || 'No Job Title'}</p>
          
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mb-4">
            {member.status}
          </div>
          
          <div className="w-full space-y-3 pt-4 border-t">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 text-slate-400" />
              <a href={`mailto:${member.email}`} className="text-esm-blue-600 hover:underline">
                {member.email}
              </a>
            </div>
            
            <div className="flex items-center gap-3 text-sm">
              <Phone className="h-4 w-4 text-slate-400" />
              <a href={`tel:${member.phone}`} className="text-esm-blue-600 hover:underline">
                {member.phone || 'Not available'}
              </a>
            </div>
            
            <div className="flex items-center gap-3 text-sm">
              <User className="h-4 w-4 text-slate-400" />
              <span>{member.role || 'No Role Assigned'}</span>
            </div>

            {member.jobTitle && (
              <div className="flex items-center gap-3 text-sm">
                <Briefcase className="h-4 w-4 text-slate-400" />
                <span>{member.jobTitle}</span>
              </div>
            )}
            
            {member.department && (
              <div className="flex items-center gap-3 text-sm">
                <Building className="h-4 w-4 text-slate-400" />
                <span>{member.department}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
