import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Clock,
  PieChart,
  Activity
} from 'lucide-react';

const chartData = {
  dailyWorkOrders: [
    { day: 'Mon', completed: 42, created: 38 },
    { day: 'Tue', completed: 38, created: 45 },
    { day: 'Wed', completed: 51, created: 42 },
    { day: 'Thu', completed: 48, created: 52 },
    { day: 'Fri', completed: 55, created: 48 },
    { day: 'Sat', completed: 32, created: 28 },
    { day: 'Sun', completed: 28, created: 24 }
  ],
  statusDistribution: [
    { status: 'Completed', count: 423, percentage: 62, color: 'bg-green-500' },
    { status: 'In Progress', count: 156, percentage: 23, color: 'bg-blue-500' },
    { status: 'Pending', count: 89, percentage: 13, color: 'bg-yellow-500' },
    { status: 'Overdue', count: 12, percentage: 2, color: 'bg-red-500' }
  ],
  technicianPerformance: [
    { name: 'John Smith', completed: 45, efficiency: 92, rating: 4.8 },
    { name: 'Sarah Johnson', completed: 38, efficiency: 89, rating: 4.7 },
    { name: 'Mike Wilson', completed: 42, efficiency: 85, rating: 4.6 },
    { name: 'Emily Davis', completed: 35, efficiency: 88, rating: 4.5 },
    { name: 'Tom Anderson', completed: 29, efficiency: 82, rating: 4.4 }
  ]
};

export function WorkOrderAnalytics() {
  const [timeRange, setTimeRange] = useState('7d');

  return (
    <div className="space-y-6">
      {/* Analytics Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold">Work Order Analytics</h3>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="1y">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Work Orders Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Daily Work Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {chartData.dailyWorkOrders.map((day, index) => (
                <div key={day.day} className="flex items-center gap-4">
                  <span className="text-sm font-medium w-8">{day.day}</span>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                        <div 
                          className="h-full bg-green-500 rounded-full"
                          style={{ width: `${(day.completed / 60) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-12">{day.completed}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${(day.created / 60) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-12">{day.created}</span>
                    </div>
                  </div>
                </div>
              ))}
              <div className="flex items-center gap-4 pt-2 border-t">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                  <span className="text-sm">Completed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full" />
                  <span className="text-sm">Created</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {chartData.statusDistribution.map((item) => (
                <div key={item.status} className="flex items-center gap-4">
                  <div className={`w-4 h-4 rounded-full ${item.color}`} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{item.status}</span>
                      <span className="text-sm text-muted-foreground">{item.count}</span>
                    </div>
                    <div className="bg-muted rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-full ${item.color} rounded-full`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-xs font-medium w-8">{item.percentage}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Technician Performance */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Technician Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {chartData.technicianPerformance.map((tech, index) => (
                <div key={tech.name} className="flex items-center gap-4 p-3 rounded-lg border">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-medium">
                      {tech.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{tech.name}</p>
                      <p className="text-xs text-muted-foreground">#{index + 1} performer</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-lg font-bold">{tech.completed}</p>
                      <p className="text-xs text-muted-foreground">Completed</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold">{tech.efficiency}%</p>
                      <p className="text-xs text-muted-foreground">Efficiency</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center gap-1">
                        <span className="text-lg font-bold">{tech.rating}</span>
                        <span className="text-yellow-500">★</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Rating</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}