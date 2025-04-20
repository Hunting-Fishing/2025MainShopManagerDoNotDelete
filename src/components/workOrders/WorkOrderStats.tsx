
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Clock, AlertCircle, CheckCircle, BarChart3 } from "lucide-react";
import { format } from "date-fns";

interface StatsData {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  overdue: number;
  todaysDue: number;
  averageCompletionTime?: number;
}

export function WorkOrderStats() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      
      // Get counts of work orders by status
      const { data: statusCounts, error: countError } = await supabase
        .from('work_orders')
        .select('status', { count: 'exact', head: false })
        .eq('status', 'pending');

      const { data: inProgressCounts } = await supabase
        .from('work_orders')
        .select('status', { count: 'exact', head: false })
        .eq('status', 'in-progress');
        
      const { data: completedCounts } = await supabase
        .from('work_orders')
        .select('status', { count: 'exact', head: false })
        .eq('status', 'completed');
      
      // Get overdue work orders (due date before today and not completed)
      const { data: overdueCounts } = await supabase
        .from('work_orders')
        .select('status', { count: 'exact', head: false })
        .lt('end_time', today)
        .not('status', 'eq', 'completed')
        .not('status', 'eq', 'cancelled');
        
      // Get today's due work orders
      const { data: todaysDue } = await supabase
        .from('work_orders')
        .select('status', { count: 'exact', head: false })
        .eq('end_time', today)
        .not('status', 'eq', 'completed')
        .not('status', 'eq', 'cancelled');
        
      // Get total work orders
      const { count: totalCount } = await supabase
        .from('work_orders')
        .select('*', { count: 'exact', head: true });
      
      if (countError) throw countError;

      setStats({
        total: totalCount || 0,
        pending: statusCounts?.length || 0,
        inProgress: inProgressCounts?.length || 0,
        completed: completedCounts?.length || 0,
        overdue: overdueCounts?.length || 0,
        todaysDue: todaysDue?.length || 0
      });
    } catch (error) {
      console.error("Error fetching work order stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6 h-[90px] flex items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const statCards = [
    {
      label: "Total Work Orders",
      value: stats.total,
      icon: <BarChart3 className="h-5 w-5 text-purple-500" />,
      bgColor: "bg-purple-50",
      textColor: "text-purple-700",
    },
    {
      label: "Pending",
      value: stats.pending,
      icon: <Clock className="h-5 w-5 text-yellow-500" />,
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-700",
    },
    {
      label: "In Progress",
      value: stats.inProgress,
      icon: <Clock className="h-5 w-5 text-blue-500" />,
      bgColor: "bg-blue-50",
      textColor: "text-blue-700",
    },
    {
      label: "Completed",
      value: stats.completed,
      icon: <CheckCircle className="h-5 w-5 text-green-500" />,
      bgColor: "bg-green-50",
      textColor: "text-green-700",
    },
    {
      label: "Overdue",
      value: stats.overdue,
      icon: <AlertCircle className="h-5 w-5 text-red-500" />,
      bgColor: "bg-red-50",
      textColor: "text-red-700",
    },
    {
      label: "Due Today",
      value: stats.todaysDue,
      icon: <Clock className="h-5 w-5 text-orange-500" />,
      bgColor: "bg-orange-50",
      textColor: "text-orange-700",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      {statCards.map((stat, i) => (
        <Card key={i} className={`border-l-4 border-l-${stat.textColor.split('-')[1]}-500`}>
          <CardContent className={`p-4 ${stat.bgColor} flex justify-between items-center`}>
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.textColor}`}>{stat.value}</p>
            </div>
            <div className={`p-2 rounded-full ${stat.bgColor} border border-${stat.textColor.split('-')[1]}-200`}>
              {stat.icon}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
