
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Clock, FileText, User, Check, AlertCircle } from "lucide-react";
import { TeamMember } from "@/types/team";
import { Badge } from "@/components/ui/badge";

interface ActivityTabProps {
  member: TeamMember;
}

export function ActivityTab({ member }: ActivityTabProps) {
  const activities = member.recentActivity || [];

  // Helper function to get the appropriate icon
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "login":
        return <User className="h-4 w-4 text-slate-600" />;
      case "workOrder":
        return <FileText className="h-4 w-4 text-blue-600" />;
      case "invoice":
        return <FileText className="h-4 w-4 text-green-600" />;
      default:
        return <Clock className="h-4 w-4 text-slate-600" />;
    }
  };

  // Helper function to get the badge for activity status
  const getActivityBadge = (description: string) => {
    if (description.includes("Created")) {
      return <Badge className="bg-green-500">Created</Badge>;
    } else if (description.includes("Updated")) {
      return <Badge className="bg-blue-500">Updated</Badge>;
    } else if (description.includes("Viewed")) {
      return <Badge className="bg-slate-500">Viewed</Badge>;
    } else if (description.includes("Completed")) {
      return <Badge className="bg-purple-500">Completed</Badge>;
    } else {
      return null;
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>
          Recent actions performed by this team member
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {activities && activities.length > 0 ? (
            activities.map((activity, index) => (
              <li key={index} className="flex items-start gap-4 pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                <div className="rounded-full bg-slate-100 p-2">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-slate-900">{activity.description}</p>
                    {getActivityBadge(activity.description)}
                  </div>
                  <div className="flex items-center mt-1 text-xs text-slate-500">
                    <Clock className="h-3 w-3 mr-1" />
                    {new Date(activity.date).toLocaleString()}
                  </div>
                </div>
              </li>
            ))
          ) : (
            <li className="text-center py-6 text-slate-500">
              No recent activity to display
            </li>
          )}
        </ul>
      </CardContent>
    </Card>
  );
}
