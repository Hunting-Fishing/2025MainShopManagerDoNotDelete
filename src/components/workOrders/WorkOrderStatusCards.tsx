import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { WorkOrder } from '@/types/workOrder';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, CheckCircle, AlertTriangle, Calendar } from 'lucide-react';
import { format, startOfDay, startOfWeek, startOfMonth, isWithinInterval, endOfDay, endOfWeek, endOfMonth } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface WorkOrderStatusCardsProps {
  workOrders: WorkOrder[];
  loading: boolean;
}

type DateRange = 'day' | 'week' | 'month' | 'all';

export function WorkOrderStatusCards({ workOrders, loading }: WorkOrderStatusCardsProps) {
  const [dateRange, setDateRange] = useState<DateRange>('all');

  const getFilteredWorkOrders = () => {
    if (dateRange === 'all') return workOrders;

    const now = new Date();
    let start: Date;
    let end: Date;

    switch (dateRange) {
      case 'day':
        start = startOfDay(now);
        end = endOfDay(now);
        break;
      case 'week':
        start = startOfWeek(now);
        end = endOfWeek(now);
        break;
      case 'month':
        start = startOfMonth(now);
        end = endOfMonth(now);
        break;
      default:
        return workOrders;
    }

    return workOrders.filter(wo => {
      const woDate = new Date(wo.createdAt);
      return isWithinInterval(woDate, { start, end });
    });
  };

  const filteredOrders = getFilteredWorkOrders();
  const pendingCount = filteredOrders.filter(wo => wo.status === 'pending').length;
  const inProgressCount = filteredOrders.filter(wo => wo.status === 'in-progress').length;
  const completedCount = filteredOrders.filter(wo => wo.status === 'completed').length;

  const getRangeDisplay = () => {
    const now = new Date();
    switch (dateRange) {
      case 'day':
        return format(now, 'MMM dd, yyyy');
      case 'week':
        return `Week of ${format(startOfWeek(now), 'MMM dd')}`;
      case 'month':
        return format(now, 'MMMM yyyy');
      default:
        return 'All Time';
    }
  };

  if (loading) {
    return (
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="bg-slate-50 p-4 rounded-lg mb-6">
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-slate-600">
          Showing stats for: <span className="font-medium">{getRangeDisplay()}</span>
        </div>
        <Select
          value={dateRange}
          onValueChange={(value) => setDateRange(value as DateRange)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        <Card className="bg-white border shadow-sm overflow-hidden">
          <CardContent className="p-4">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-500">Total Work Orders</span>
              <div className="flex items-center mt-1">
                <span className="text-3xl font-bold text-purple-700">{filteredOrders.length}</span>
                <span className="ml-2 p-1 rounded-full bg-purple-100">
                  <Calendar className="w-4 h-4 text-purple-700" />
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border shadow-sm overflow-hidden">
          <CardContent className="p-4">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-500">Pending</span>
              <div className="flex items-center mt-1">
                <span className="text-3xl font-bold text-yellow-600">{pendingCount}</span>
                <span className="ml-2 p-1 rounded-full bg-yellow-100">
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border shadow-sm overflow-hidden">
          <CardContent className="p-4">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-500">In Progress</span>
              <div className="flex items-center mt-1">
                <span className="text-3xl font-bold text-blue-600">{inProgressCount}</span>
                <span className="ml-2 p-1 rounded-full bg-blue-100">
                  <Clock className="w-4 h-4 text-blue-600" />
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border shadow-sm overflow-hidden">
          <CardContent className="p-4">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-500">Completed</span>
              <div className="flex items-center mt-1">
                <span className="text-3xl font-bold text-green-600">{completedCount}</span>
                <span className="ml-2 p-1 rounded-full bg-green-100">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border shadow-sm overflow-hidden">
          <CardContent className="p-4">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-500">Overdue</span>
              <div className="flex items-center mt-1">
                <span className="text-3xl font-bold text-red-600">{overdueCount}</span>
                <span className="ml-2 p-1 rounded-full bg-red-100">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border shadow-sm overflow-hidden">
          <CardContent className="p-4">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-500">Due Today</span>
              <div className="flex items-center mt-1">
                <span className="text-3xl font-bold text-orange-600">{dueTodayCount}</span>
                <span className="ml-2 p-1 rounded-full bg-orange-100">
                  <Calendar className="w-4 h-4 text-orange-600" />
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
