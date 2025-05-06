
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TeamMember } from "@/types/team";
import { Mail, Phone, Calendar } from "lucide-react";
import { format } from "date-fns";

interface TeamMemberDetailsProps {
  member: TeamMember;
}

export function TeamMemberDetails({ member }: TeamMemberDetailsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <a href={`mailto:${member.email}`} className="text-blue-600 hover:underline">
              {member.email}
            </a>
          </div>
          
          {member.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <a href={`tel:${member.phone}`} className="text-blue-600 hover:underline">
                {member.phone}
              </a>
            </div>
          )}
          
          {member.joinDate && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Joined: {format(new Date(member.joinDate), "MMMM d, yyyy")}</span>
            </div>
          )}
        </CardContent>
      </Card>
      
      {member.role === "Technician" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Work Orders</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">Assigned</p>
                <p className="text-2xl font-bold text-esm-blue-600">
                  {member.workOrders.assigned}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-esm-blue-600">
                  {member.workOrders.completed}
                </p>
              </div>
            </div>
            
            <div className="pt-2 border-t border-gray-100">
              <p className="text-sm text-muted-foreground">
                Completion rate: {calculateCompletionRate(member.workOrders.assigned, member.workOrders.completed)}%
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function calculateCompletionRate(assigned: number, completed: number): number {
  if (assigned === 0) return 0;
  return Math.round((completed / assigned) * 100);
}
