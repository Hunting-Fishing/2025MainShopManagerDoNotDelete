
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { WorkOrder } from '@/types/workOrder';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, CheckCircle, AlertTriangle, Calendar } from 'lucide-react';
import { format, startOfDay, startOfWeek, startOfMonth, isWithinInterval, endOfDay, endOfWeek, endOfMonth, isAfter, isBefore } from 'date-fns';
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
      const woDate = new Date(wo.createdAt || wo.date);
      return isWithinInterval(woDate, { start, end });
    });
  };

  const filteredOrders = getFilteredWorkOrders();
  const pendingCount = filteredOrders.filter(wo => wo.status === 'pending').length;
  const inProgressCount = filteredOrders.filter(wo => wo.status === 'in-progress').length;
  const completedCount = filteredOrders.filter(wo => wo.status === 'completed').length;
  
  // Calculate overdue work orders (due date is before today and status is not completed)
  const overdueCount = filteredOrders.filter(wo => {
    const dueDate = new Date(wo.dueDate);
    const today = new Date();
    return isAfter(today, dueDate) && wo.status !== 'completed';
  }).length;
  
  // Calculate work orders due today
  const dueTodayCount = filteredOrders.filter(wo => {
    const dueDate = new Date(wo.dueDate);
    const today = new Date();
    return (
      isBefore(dueDate, endOfDay(today)) && 
      isAfter(dueDate, startOfDay(today))
    );
  }).length;

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
    <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-6 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div className="text-sm font-medium text-slate-800">
          Showing stats for: <span className="text-indigo-600">{getRangeDisplay()}</span>
        </div>
        <Select
          value={dateRange}
          onValueChange={(value) => setDateRange(value as DateRange)}
        >
          <SelectTrigger className="w-[180px] bg-white border-slate-200">
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
        <Card className="bg-white border-slate-200 shadow-sm transition-all duration-200 hover:shadow-md">
          <CardContent className="p-4">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-slate-500">Total Work Orders</span>
              <div className="flex items-center mt-2">
                <span className="text-3xl font-bold text-slate-800">{filteredOrders.length}</span>
                <span className="ml-2 p-2 rounded-full bg-indigo-100">
                  <Calendar className="w-5 h-5 text-indigo-600" />
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm transition-all duration-200 hover:shadow-md">
          <CardContent className="p-4">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-slate-500">Pending</span>
              <div className="flex items-center mt-2">
                <span className="text-3xl font-bold text-amber-600">{pendingCount}</span>
                <span className="ml-2 p-2 rounded-full bg-amber-100">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm transition-all duration-200 hover:shadow-md">
          <CardContent className="p-4">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-slate-500">In Progress</span>
              <div className="flex items-center mt-2">
                <span className="text-3xl font-bold text-blue-600">{inProgressCount}</span>
                <span className="ml-2 p-2 rounded-full bg-blue-100">
                  <Clock className="w-5 h-5 text-blue-600" />
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm transition-all duration-200 hover:shadow-md">
          <CardContent className="p-4">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-slate-500">Completed</span>
              <div className="flex items-center mt-2">
                <span className="text-3xl font-bold text-green-600">{completedCount}</span>
                <span className="ml-2 p-2 rounded-full bg-green-100">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm transition-all duration-200 hover:shadow-md">
          <CardContent className="p-4">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-slate-500">Overdue</span>
              <div className="flex items-center mt-2">
                <span className="text-3xl font-bold text-red-600">{overdueCount}</span>
                <span className="ml-2 p-2 rounded-full bg-red-100">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
