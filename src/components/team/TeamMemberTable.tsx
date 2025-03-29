
import { Link } from "react-router-dom";
import { TeamMember } from "@/types/team";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface TeamMemberTableProps {
  members: TeamMember[];
  getInitials: (name: string) => string;
}

export function TeamMemberTable({ members, getInitials }: TeamMemberTableProps) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Department</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {members.map((member) => (
              <tr key={member.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="" alt={member.name} />
                      <AvatarFallback className="bg-esm-blue-100 text-esm-blue-700 text-xs">{getInitials(member.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-slate-900">{member.name}</p>
                      <p className="text-xs text-slate-500">{member.jobTitle}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">{member.role}</td>
                <td className="px-4 py-3">{member.department}</td>
                <td className="px-4 py-3">
                  <a href={`mailto:${member.email}`} className="text-esm-blue-600 hover:underline">
                    {member.email}
                  </a>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={member.status === "Active" ? "success" : "destructive"}>
                    {member.status}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <Button asChild size="sm" variant="outline">
                      <Link to={`/team/${member.id}`}>
                        View
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline">
                      <Link to={`/team/${member.id}?tab=permissions`}>
                        Permissions
                      </Link>
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {members.length === 0 && (
        <div className="p-8 text-center text-slate-500">
          No team members found matching your filters.
        </div>
      )}
    </div>
  );
}
