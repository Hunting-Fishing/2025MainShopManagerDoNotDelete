import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Clock, 
  UserPlus, 
  Shield, 
  Building2, 
  Edit,
  Trash2,
  UserMinus
} from 'lucide-react';

const activities = [
  {
    id: 1,
    type: 'user_added',
    icon: UserPlus,
    title: 'New team member added',
    description: 'John Smith joined Service Operations department',
    user: 'Sarah Johnson',
    timestamp: '2 hours ago',
    color: 'text-green-600 bg-green-50'
  },
  {
    id: 2,
    type: 'role_updated',
    icon: Shield,
    title: 'Role permissions updated',
    description: 'Technician role permissions were modified',
    user: 'Mike Wilson',
    timestamp: '4 hours ago',
    color: 'text-blue-600 bg-blue-50'
  },
  {
    id: 3,
    type: 'department_created',
    icon: Building2,
    title: 'New department created',
    description: 'Quality Control department was established',
    user: 'Admin',
    timestamp: '6 hours ago',
    color: 'text-purple-600 bg-purple-50'
  },
  {
    id: 4,
    type: 'user_updated',
    icon: Edit,
    title: 'Profile updated',
    description: 'Emma Davis updated her contact information',
    user: 'Emma Davis',
    timestamp: '8 hours ago',
    color: 'text-orange-600 bg-orange-50'
  },
  {
    id: 5,
    type: 'user_removed',
    icon: UserMinus,
    title: 'Team member removed',
    description: 'Former employee access was revoked',
    user: 'HR System',
    timestamp: '1 day ago',
    color: 'text-red-600 bg-red-50'
  },
  {
    id: 6,
    type: 'role_assigned',
    icon: Shield,
    title: 'Role assignment',
    description: 'Lisa Chen was assigned Manager role',
    user: 'Sarah Johnson',
    timestamp: '1 day ago',
    color: 'text-indigo-600 bg-indigo-50'
  }
];

export function TeamActivityTimeline() {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-blue-600" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 bottom-0 w-px bg-border"></div>
          
          <div className="space-y-6">
            {activities.map((activity, index) => {
              const Icon = activity.icon;
              return (
                <div key={activity.id} className="relative flex items-start gap-4">
                  {/* Timeline dot */}
                  <div className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full ${activity.color} border-2 border-white shadow-sm`}>
                    <Icon className="h-3 w-3" />
                  </div>
                  
                  {/* Activity content */}
                  <div className="flex-1 min-w-0 pb-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium">{activity.title}</h4>
                        <p className="text-sm text-muted-foreground">{activity.description}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>by {activity.user}</span>
                          <span>•</span>
                          <span>{activity.timestamp}</span>
                        </div>
                      </div>
                      
                      {index < 2 && (
                        <Badge variant="outline" className="text-xs">
                          New
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="text-center pt-4 border-t">
          <button className="text-sm text-muted-foreground hover:text-foreground">
            View all activity
          </button>
        </div>
      </CardContent>
    </Card>
  );
}