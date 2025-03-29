
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Clock, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Mock activity data - in a real app, this would be fetched based on work order ID
interface Activity {
  id: string;
  description: string;
  date: string;
  staffName: string;
}

interface WorkOrderActivityHistoryProps {
  workOrderId: string;
}

export function WorkOrderActivityHistory({ workOrderId }: WorkOrderActivityHistoryProps) {
  // This would be a real API call in a production app
  // For now, we'll use mock data
  const mockActivities: Activity[] = [
    {
      id: "act-1",
      description: "Created work order",
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
      staffName: "Michael Brown",
    },
    {
      id: "act-2",
      description: "Updated status to In Progress",
      date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
      staffName: "Sarah Johnson",
    },
    {
      id: "act-3",
      description: "Added inventory items",
      date: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12 hours ago
      staffName: "David Lee",
    },
    {
      id: "act-4",
      description: "Updated time entries",
      date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      staffName: "Sarah Johnson",
    },
    {
      id: "act-5",
      description: "Viewed work order",
      date: new Date().toISOString(), // Now
      staffName: "Admin User",
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity History</CardTitle>
        <CardDescription>
          Timeline of all actions taken on this work order
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative pl-6 border-l border-slate-200">
          {mockActivities.map((activity, index) => (
            <div key={activity.id} className="mb-6 last:mb-0">
              <div className="absolute w-3 h-3 bg-blue-500 rounded-full -left-[6.5px]" />
              <div className="flex justify-between">
                <div>
                  <p className="font-medium">{activity.description}</p>
                  <div className="flex items-center mt-1 text-sm text-slate-500">
                    <User className="h-3 w-3 mr-1" />
                    <span>{activity.staffName}</span>
                  </div>
                </div>
                <div className="text-xs text-slate-500">
                  {new Date(activity.date).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
