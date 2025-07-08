import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Clock, 
  User, 
  CheckCircle, 
  AlertTriangle, 
  Settings,
  MessageSquare,
  Phone,
  FileText,
  Filter
} from 'lucide-react';

const activities = [
  {
    id: 1,
    type: 'work_order_created',
    icon: FileText,
    title: 'Work Order Created',
    description: 'WO-2024-001234 created for brake inspection',
    user: 'Sarah Johnson',
    timestamp: '10 minutes ago',
    color: 'text-blue-600 bg-blue-50',
    priority: 'high'
  },
  {
    id: 2,
    type: 'technician_assigned',
    icon: User,
    title: 'Technician Assigned',
    description: 'Mike Wilson assigned to oil change service',
    user: 'System',
    timestamp: '15 minutes ago',
    color: 'text-green-600 bg-green-50',
    priority: 'normal'
  },
  {
    id: 3,
    type: 'status_updated',
    icon: Settings,
    title: 'Status Updated',
    description: 'WO-2024-001230 status changed to "In Progress"',
    user: 'Tom Anderson',
    timestamp: '22 minutes ago',
    color: 'text-orange-600 bg-orange-50',
    priority: 'normal'
  },
  {
    id: 4,
    type: 'work_order_completed',
    icon: CheckCircle,
    title: 'Work Order Completed',
    description: 'Transmission repair completed successfully',
    user: 'Emily Davis',
    timestamp: '35 minutes ago',
    color: 'text-green-600 bg-green-50',
    priority: 'normal'
  },
  {
    id: 5,
    type: 'customer_communication',
    icon: MessageSquare,
    title: 'Customer Communication',
    description: 'SMS sent to customer about appointment reminder',
    user: 'System',
    timestamp: '1 hour ago',
    color: 'text-purple-600 bg-purple-50',
    priority: 'low'
  },
  {
    id: 6,
    type: 'overdue_alert',
    icon: AlertTriangle,
    title: 'Overdue Alert',
    description: 'WO-2024-001225 is now 2 days overdue',
    user: 'System',
    timestamp: '1 hour ago',
    color: 'text-red-600 bg-red-50',
    priority: 'urgent'
  },
  {
    id: 7,
    type: 'phone_call',
    icon: Phone,
    title: 'Customer Call',
    description: 'Outbound call made to discuss repair estimate',
    user: 'John Smith',
    timestamp: '2 hours ago',
    color: 'text-blue-600 bg-blue-50',
    priority: 'normal'
  },
  {
    id: 8,
    type: 'work_order_updated',
    icon: Settings,
    title: 'Work Order Updated',
    description: 'Additional parts added to WO-2024-001228',
    user: 'Mike Wilson',
    timestamp: '3 hours ago',
    color: 'text-yellow-600 bg-yellow-50',
    priority: 'normal'
  }
];

const priorityColors = {
  low: 'bg-green-100 text-green-800',
  normal: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800'
};

export function WorkOrderTimeline() {
  const [filter, setFilter] = useState('all');
  const [timeRange, setTimeRange] = useState('today');

  const filteredActivities = activities.filter(activity => {
    if (filter === 'all') return true;
    return activity.type === filter;
  });

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold">Activity Timeline</h3>
        </div>
        <div className="flex items-center gap-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Activities</SelectItem>
              <SelectItem value="work_order_created">Work Orders Created</SelectItem>
              <SelectItem value="technician_assigned">Assignments</SelectItem>
              <SelectItem value="status_updated">Status Updates</SelectItem>
              <SelectItem value="work_order_completed">Completions</SelectItem>
              <SelectItem value="customer_communication">Communications</SelectItem>
              <SelectItem value="overdue_alert">Overdue Alerts</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Recent Activity ({filteredActivities.length})</span>
            <Button variant="outline" size="sm">
              <Clock className="h-4 w-4 mr-2" />
              Real-time Updates
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border"></div>
            
            {/* Timeline items */}
            <div className="space-y-6">
              {filteredActivities.map((activity, index) => {
                const Icon = activity.icon;
                return (
                  <div key={activity.id} className="relative flex items-start gap-4">
                    {/* Timeline dot */}
                    <div className={`flex-shrink-0 w-12 h-12 rounded-full border-4 border-background flex items-center justify-center ${activity.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0 pb-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm font-medium">{activity.title}</h4>
                            <Badge className={priorityColors[activity.priority as keyof typeof priorityColors]}>
                              {activity.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {activity.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {activity.user}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {activity.timestamp}
                            </span>
                          </div>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex items-center gap-1 ml-4">
                          <Button variant="ghost" size="sm">
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Load more */}
            <div className="text-center pt-6">
              <Button variant="outline">
                Load More Activities
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">23</div>
            <div className="text-sm text-muted-foreground">Created Today</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">18</div>
            <div className="text-sm text-muted-foreground">Completed Today</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">12</div>
            <div className="text-sm text-muted-foreground">In Progress</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">3</div>
            <div className="text-sm text-muted-foreground">Overdue</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}