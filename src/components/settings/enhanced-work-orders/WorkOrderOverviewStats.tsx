import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  DollarSign,
  Users,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

const stats = [
  {
    title: 'Total Work Orders',
    value: '2,847',
    change: '+12.5%',
    trend: 'up',
    icon: FileText,
    color: 'bg-gradient-to-br from-blue-500 to-blue-600'
  },
  {
    title: 'In Progress',
    value: '156',
    change: '+8.2%',
    trend: 'up',
    icon: Clock,
    color: 'bg-gradient-to-br from-orange-500 to-orange-600'
  },
  {
    title: 'Completed This Month',
    value: '423',
    change: '+15.3%',
    trend: 'up',
    icon: CheckCircle,
    color: 'bg-gradient-to-br from-green-500 to-green-600'
  },
  {
    title: 'Overdue',
    value: '12',
    change: '-25.0%',
    trend: 'down',
    icon: AlertTriangle,
    color: 'bg-gradient-to-br from-red-500 to-red-600'
  },
  {
    title: 'Revenue This Month',
    value: '$45,240',
    change: '+18.7%',
    trend: 'up',
    icon: DollarSign,
    color: 'bg-gradient-to-br from-emerald-500 to-emerald-600'
  },
  {
    title: 'Active Technicians',
    value: '24',
    change: '+2',
    trend: 'up',
    icon: Users,
    color: 'bg-gradient-to-br from-purple-500 to-purple-600'
  }
];

export function WorkOrderOverviewStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        const isPositive = stat.trend === 'up';
        const TrendIcon = isPositive ? TrendingUp : TrendingDown;
        
        return (
          <Card key={stat.title} className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <div className="flex items-center gap-1">
                    <TrendIcon className={`h-3 w-3 ${isPositive ? 'text-green-600' : 'text-red-600'}`} />
                    <span className={`text-xs font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.change}
                    </span>
                    <span className="text-xs text-muted-foreground">vs last month</span>
                  </div>
                </div>
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}