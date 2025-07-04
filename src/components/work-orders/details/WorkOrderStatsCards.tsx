import React from 'react';
import { WorkOrder } from '@/types/workOrder';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { Card, CardContent } from '@/components/ui/card';
import { 
  DollarSign, 
  Clock, 
  Package, 
  TrendingUp,
  Users,
  Calendar,
  Wrench,
  CheckCircle2
} from 'lucide-react';

interface WorkOrderStatsCardsProps {
  workOrder: WorkOrder;
  jobLines?: WorkOrderJobLine[];
  parts?: WorkOrderPart[];
  timeEntries?: any[];
}

export function WorkOrderStatsCards({ 
  workOrder, 
  jobLines = [], 
  parts = [], 
  timeEntries = [] 
}: WorkOrderStatsCardsProps) {
  // Calculate statistics
  const totalCost = React.useMemo(() => {
    const laborCost = jobLines?.reduce((sum, line) => sum + (line.total_amount || 0), 0) || 0;
    const partsCost = parts?.reduce((sum, part) => sum + ((part.quantity || 0) * (part.unit_price || 0)), 0) || 0;
    return laborCost + partsCost;
  }, [jobLines, parts]);

  const totalLaborHours = React.useMemo(() => {
    return timeEntries?.reduce((sum, entry) => {
      // Duration is stored in minutes, convert to hours
      const durationInMinutes = entry.duration || 0;
      return sum + (durationInMinutes / 60);
    }, 0) || 0;
  }, [timeEntries]);

  const partsCount = parts?.length || 0;
  
  const completionPercentage = React.useMemo(() => {
    const statusMap: { [key: string]: number } = {
      'draft': 0,
      'pending': 10,
      'scheduled': 20,
      'in_progress': 50,
      'awaiting_parts': 40,
      'quality_check': 80,
      'completed': 100,
      'cancelled': 0,
      'on_hold': 30
    };
    return statusMap[workOrder.status] || 0;
  }, [workOrder.status]);

  const stats = [
    {
      title: 'Total Cost',
      value: `$${totalCost.toFixed(2)}`,
      subtitle: 'Labor + Parts',
      icon: DollarSign,
      gradient: 'from-emerald-500 to-emerald-600',
      bgGradient: 'from-emerald-50 to-emerald-100',
      iconBg: 'bg-emerald-500',
      trend: totalCost > 500 ? '+12%' : null
    },
    {
      title: 'Labor Hours',
      value: totalLaborHours.toFixed(1),
      subtitle: `${timeEntries.length} entries`,
      icon: Clock,
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100',
      iconBg: 'bg-blue-500',
      trend: totalLaborHours > 8 ? 'High' : null
    },
    {
      title: 'Parts Used',
      value: partsCount.toString(),
      subtitle: `${parts.filter(p => p.status === 'installed').length} installed`,
      icon: Package,
      gradient: 'from-purple-500 to-purple-600',
      bgGradient: 'from-purple-50 to-purple-100',
      iconBg: 'bg-purple-500',
      trend: null
    },
    {
      title: 'Progress',
      value: `${completionPercentage}%`,
      subtitle: workOrder.status.replace('_', ' '),
      icon: TrendingUp,
      gradient: 'from-orange-500 to-orange-600',
      bgGradient: 'from-orange-50 to-orange-100',
      iconBg: 'bg-orange-500',
      trend: completionPercentage > 50 ? 'On Track' : null
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card 
            key={stat.title}
            className={`modern-card gradient-border overflow-hidden hover:shadow-lg transition-all duration-300 animate-fade-in group`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardContent className="p-0">
              <div className={`bg-gradient-to-br ${stat.bgGradient} p-6 relative`}>
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                </div>
                
                {/* Icon */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`${stat.iconBg} p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  {stat.trend && (
                    <span className="text-xs font-medium text-muted-foreground bg-white/70 px-2 py-1 rounded-full">
                      {stat.trend}
                    </span>
                  )}
                </div>
                
                {/* Content */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground font-body">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold text-foreground font-heading gradient-text">
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground font-body">
                    {stat.subtitle}
                  </p>
                </div>

                {/* Progress bar for completion percentage */}
                {stat.title === 'Progress' && (
                  <div className="mt-4">
                    <div className="w-full bg-white/30 rounded-full h-2">
                      <div 
                        className="bg-white h-2 rounded-full transition-all duration-700 ease-out"
                        style={{ width: `${completionPercentage}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}