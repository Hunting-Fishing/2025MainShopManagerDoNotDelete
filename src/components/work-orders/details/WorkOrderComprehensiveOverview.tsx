
import React from 'react';
import { WorkOrder, TimeEntry } from '@/types/workOrder';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, DollarSign, Package, User, Calendar, CheckCircle } from 'lucide-react';

interface WorkOrderComprehensiveOverviewProps {
  workOrder: WorkOrder;
  jobLines: WorkOrderJobLine[];
  allParts: WorkOrderPart[];
  timeEntries: TimeEntry[];
}

export function WorkOrderComprehensiveOverview({
  workOrder,
  jobLines,
  allParts,
  timeEntries
}: WorkOrderComprehensiveOverviewProps) {
  // Calculate totals and progress
  const totalEstimatedHours = jobLines.reduce((sum, line) => sum + (line.estimated_hours || 0), 0);
  const totalPartsValue = allParts.reduce((sum, part) => sum + (part.total_price || 0), 0);
  const totalTimeSpent = timeEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0) / 60; // Convert to hours
  const completedJobLines = jobLines.filter(line => line.status === 'completed').length;
  const progressPercentage = jobLines.length > 0 ? (completedJobLines / jobLines.length) * 100 : 0;

  // Status color mapping
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'on-hold': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl font-bold">
                Work Order #{workOrder.work_order_number || workOrder.id.slice(0, 8)}
              </CardTitle>
              <p className="text-muted-foreground mt-1">{workOrder.description}</p>
            </div>
            <Badge className={getStatusColor(workOrder.status)}>
              {workOrder.status?.replace('-', ' ').toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Customer</p>
                <p className="font-medium">{workOrder.customer_name || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="font-medium">
                  {new Date(workOrder.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Technician</p>
                <p className="font-medium">{workOrder.technician || 'Unassigned'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Progress</p>
                <p className="font-medium">{progressPercentage.toFixed(0)}%</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Card */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Job Lines Completed</span>
              <span>{completedJobLines} of {jobLines.length}</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="text-center p-3 bg-muted rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{jobLines.length}</p>
                <p className="text-sm text-muted-foreground">Total Job Lines</p>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <p className="text-2xl font-bold text-green-600">{allParts.length}</p>
                <p className="text-sm text-muted-foreground">Parts Required</p>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <p className="text-2xl font-bold text-purple-600">{timeEntries.length}</p>
                <p className="text-sm text-muted-foreground">Time Entries</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Time Summary */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Summary</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Estimated:</span>
                <span className="font-medium">{totalEstimatedHours.toFixed(1)}h</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Actual:</span>
                <span className="font-medium">{totalTimeSpent.toFixed(1)}h</span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span className="text-sm font-medium">Variance:</span>
                <span className={`font-medium ${
                  totalTimeSpent > totalEstimatedHours ? 'text-red-600' : 'text-green-600'
                }`}>
                  {totalTimeSpent > totalEstimatedHours ? '+' : ''}{(totalTimeSpent - totalEstimatedHours).toFixed(1)}h
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial Summary */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Financial Summary</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Parts:</span>
                <span className="font-medium">${totalPartsValue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Labor:</span>
                <span className="font-medium">${(jobLines.reduce((sum, line) => sum + (line.total_amount || 0), 0)).toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span className="text-sm font-medium">Total:</span>
                <span className="font-bold text-lg">
                  ${(totalPartsValue + jobLines.reduce((sum, line) => sum + (line.total_amount || 0), 0)).toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Parts Summary */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Parts Summary</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Total Parts:</span>
                <span className="font-medium">{allParts.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Installed:</span>
                <span className="font-medium text-green-600">
                  {allParts.filter(part => part.status === 'installed').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Pending:</span>
                <span className="font-medium text-yellow-600">
                  {allParts.filter(part => part.status === 'pending' || part.status === 'ordered').length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
