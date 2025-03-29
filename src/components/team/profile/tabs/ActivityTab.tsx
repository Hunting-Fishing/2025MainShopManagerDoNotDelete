
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Clock, FileText, User } from "lucide-react";

interface Activity {
  type: string;
  date: string;
  description: string;
}

interface ActivityTabProps {
  activities?: Activity[];
}

export function ActivityTab({ activities }: ActivityTabProps) {
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
                  {activity.type === "login" && <User className="h-4 w-4 text-slate-600" />}
                  {activity.type === "workOrder" && <FileText className="h-4 w-4 text-slate-600" />}
                  {activity.type === "invoice" && <FileText className="h-4 w-4 text-slate-600" />}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-900">{activity.description}</p>
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
