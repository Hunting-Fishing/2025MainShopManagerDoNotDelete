import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, AlertTriangle, CheckCircle, Wrench } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface MaintenanceTask {
  id: string;
  title: string;
  equipmentId: string;
  equipmentName: string;
  type: 'preventive' | 'corrective' | 'emergency';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'scheduled' | 'in-progress' | 'completed' | 'overdue';
  assignedTo: string;
  scheduledDate: string;
  estimatedDuration: number; // in hours
  description: string;
  lastCompleted?: string;
}

const mockTasks: MaintenanceTask[] = [
  {
    id: '1',
    title: 'Hydraulic Fluid Change',
    equipmentId: '1',
    equipmentName: 'Hydraulic Lift #1',
    type: 'preventive',
    priority: 'medium',
    status: 'scheduled',
    assignedTo: 'John Smith',
    scheduledDate: '2024-07-15',
    estimatedDuration: 2,
    description: 'Replace hydraulic fluid and check seals',
    lastCompleted: '2024-04-15',
  },
  {
    id: '2',
    title: 'Calibration Check',
    equipmentId: '2',
    equipmentName: 'Tire Balancer',
    type: 'preventive',
    priority: 'high',
    status: 'in-progress',
    assignedTo: 'Mike Johnson',
    scheduledDate: '2024-07-12',
    estimatedDuration: 1.5,
    description: 'Calibrate tire balancer accuracy',
  },
  {
    id: '3',
    title: 'Air Filter Replacement',
    equipmentId: '3',
    equipmentName: 'Air Compressor',
    type: 'preventive',
    priority: 'low',
    status: 'completed',
    assignedTo: 'Sarah Wilson',
    scheduledDate: '2024-07-10',
    estimatedDuration: 0.5,
    description: 'Replace air intake filter',
    lastCompleted: '2024-07-10',
  },
  {
    id: '4',
    title: 'Software Update',
    equipmentId: '4',
    equipmentName: 'Diagnostic Scanner',
    type: 'corrective',
    priority: 'critical',
    status: 'overdue',
    assignedTo: 'Tech Support',
    scheduledDate: '2024-07-08',
    estimatedDuration: 1,
    description: 'Update diagnostic software to latest version',
  },
];

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'critical': return 'text-red-600';
    case 'high': return 'text-orange-600';
    case 'medium': return 'text-yellow-600';
    case 'low': return 'text-green-600';
    default: return 'text-gray-600';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'in-progress': return <Wrench className="h-4 w-4 text-blue-500" />;
    case 'overdue': return <AlertTriangle className="h-4 w-4 text-red-500" />;
    default: return <Clock className="h-4 w-4 text-gray-500" />;
  }
};

const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case 'completed': return 'default';
    case 'in-progress': return 'secondary';
    case 'overdue': return 'destructive';
    default: return 'outline';
  }
};

export function MaintenanceScheduler() {
  const [tasks] = useState<MaintenanceTask[]>(mockTasks);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const filteredTasks = tasks.filter(task => {
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    return matchesStatus && matchesPriority;
  });

  const todaysTasks = tasks.filter(task => 
    task.scheduledDate === new Date().toISOString().split('T')[0]
  );

  return (
    <div className="space-y-6">
      {/* Today's Tasks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Today's Maintenance Tasks</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {todaysTasks.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {todaysTasks.map((task) => (
                <Card key={task.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(task.status)}
                      <div>
                        <h4 className="font-semibold">{task.title}</h4>
                        <p className="text-sm text-muted-foreground">{task.equipmentName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-medium ${getPriorityColor(task.priority)}`}>
                        {task.priority.toUpperCase()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {task.estimatedDuration}h estimated
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">
              No maintenance tasks scheduled for today
            </p>
          )}
        </CardContent>
      </Card>

      {/* All Tasks */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Maintenance Schedule</CardTitle>
            <div className="flex space-x-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredTasks.map((task) => (
              <Card key={task.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(task.status)}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold">{task.title}</h3>
                        <Badge variant={getStatusVariant(task.status)}>
                          {task.status}
                        </Badge>
                        <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(task.priority)} bg-opacity-10`}>
                          {task.priority}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{task.equipmentName}</p>
                      <p className="text-xs text-muted-foreground mt-1">{task.description}</p>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="flex items-center text-sm">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(task.scheduledDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      {task.estimatedDuration}h
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <User className="h-3 w-3 mr-1" />
                      {task.assignedTo}
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}