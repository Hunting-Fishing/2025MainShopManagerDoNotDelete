
import React from 'react';
import { WorkOrder, TimeEntry } from '@/types/workOrder';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, 
  DollarSign, 
  Package, 
  User, 
  Car, 
  MapPin, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  Circle,
  Timer
} from 'lucide-react';

interface WorkOrderComprehensiveOverviewProps {
  workOrder: WorkOrder;
  jobLines: WorkOrderJobLine[];
  parts: WorkOrderPart[];
  timeEntries: TimeEntry[];
  onJobLinesChange: (jobLines: WorkOrderJobLine[]) => void;
  isEditMode: boolean;
}

export function WorkOrderComprehensiveOverview({
  workOrder,
  jobLines,
  parts,
  timeEntries,
  onJobLinesChange,
  isEditMode
}: WorkOrderComprehensiveOverviewProps) {
  // Calculate totals and progress
  const totalEstimatedHours = jobLines.reduce((sum, line) => sum + (line.estimated_hours || 0), 0);
  const totalJobLineAmount = jobLines.reduce((sum, line) => sum + (line.total_amount || 0), 0);
  const totalPartsValue = parts.reduce((sum, part) => sum + (part.total_price || 0), 0);
  const totalTimeSpent = timeEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0) / 60; // Convert to hours
  const totalBillableTime = timeEntries.filter(entry => entry.billable).reduce((sum, entry) => sum + (entry.duration || 0), 0) / 60;

  // Progress calculations
  const completedJobLines = jobLines.filter(line => line.status === 'completed').length;
  const jobLinesProgress = jobLines.length > 0 ? (completedJobLines / jobLines.length) * 100 : 0;
  
  const installedParts = parts.filter(part => part.status === 'installed').length;
  const partsProgress = parts.length > 0 ? (installedParts / parts.length) * 100 : 0;

  // Status color mapping
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-500 text-white';
      case 'in-progress':
        return 'bg-blue-500 text-white';
      case 'on-hold':
        return 'bg-yellow-500 text-white';
      case 'pending':
        return 'bg-gray-500 text-white';
      case 'cancelled':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Status and Priority Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Badge className={`px-3 py-1 ${getStatusColor(workOrder.status)}`}>
            {workOrder.status?.charAt(0).toUpperCase() + workOrder.status?.slice(1)}
          </Badge>
          {workOrder.priority && (
            <Badge variant="outline" className={getPriorityColor(workOrder.priority)}>
              <AlertTriangle className="h-3 w-3 mr-1" />
              {workOrder.priority?.charAt(0).toUpperCase() + workOrder.priority?.slice(1)} Priority
            </Badge>
          )}
        </div>
        <div className="text-sm text-muted-foreground">
          Created: {new Date(workOrder.created_at).toLocaleDateString()}
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Job Lines</p>
                <p className="text-2xl font-bold text-blue-600">{jobLines.length}</p>
                <p className="text-xs text-muted-foreground">{completedJobLines} completed</p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-500" />
            </div>
            <Progress value={jobLinesProgress} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Parts</p>
                <p className="text-2xl font-bold text-green-600">{parts.length}</p>
                <p className="text-xs text-muted-foreground">{installedParts} installed</p>
              </div>
              <Package className="h-8 w-8 text-green-500" />
            </div>
            <Progress value={partsProgress} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Time Spent</p>
                <p className="text-2xl font-bold text-purple-600">{totalTimeSpent.toFixed(1)}h</p>
                <p className="text-xs text-muted-foreground">{totalBillableTime.toFixed(1)}h billable</p>
              </div>
              <Timer className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold text-orange-600">${(totalJobLineAmount + totalPartsValue).toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">Labor + Parts</p>
              </div>
              <DollarSign className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customer and Vehicle Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="font-semibold">{workOrder.customer_name || 'Unknown Customer'}</p>
              {workOrder.customer_email && (
                <p className="text-sm text-muted-foreground">{workOrder.customer_email}</p>
              )}
              {workOrder.customer_phone && (
                <p className="text-sm text-muted-foreground">{workOrder.customer_phone}</p>
              )}
            </div>
            {workOrder.customer_address && (
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="text-sm">
                  <p>{workOrder.customer_address}</p>
                  {(workOrder.customer_city || workOrder.customer_state || workOrder.customer_zip) && (
                    <p>{[workOrder.customer_city, workOrder.customer_state, workOrder.customer_zip].filter(Boolean).join(', ')}</p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              Vehicle Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(workOrder.vehicle_year || workOrder.vehicle_make || workOrder.vehicle_model) ? (
              <div>
                <p className="font-semibold">
                  {[workOrder.vehicle_year, workOrder.vehicle_make, workOrder.vehicle_model]
                    .filter(Boolean)
                    .join(' ')}
                </p>
                {workOrder.vehicle_license_plate && (
                  <p className="text-sm text-muted-foreground">License: {workOrder.vehicle_license_plate}</p>
                )}
                {workOrder.vehicle_vin && (
                  <p className="text-sm text-muted-foreground">VIN: {workOrder.vehicle_vin}</p>
                )}
                {workOrder.vehicle_odometer && (
                  <p className="text-sm text-muted-foreground">Odometer: {workOrder.vehicle_odometer} miles</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No vehicle information available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Work Order Details */}
      <Card>
        <CardHeader>
          <CardTitle>Work Order Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {workOrder.description && (
            <div>
              <h4 className="font-medium mb-2">Description</h4>
              <p className="text-sm bg-gray-50 p-3 rounded-md">{workOrder.description}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {workOrder.technician && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Technician</p>
                  <p className="font-medium">{workOrder.technician}</p>
                </div>
              </div>
            )}

            {totalEstimatedHours > 0 && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Estimated Hours</p>
                  <p className="font-medium">{totalEstimatedHours.toFixed(1)}h</p>
                </div>
              </div>
            )}

            {workOrder.due_date && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Due Date</p>
                  <p className="font-medium">{new Date(workOrder.due_date).toLocaleDateString()}</p>
                </div>
              </div>
            )}
          </div>

          {workOrder.notes && (
            <div>
              <h4 className="font-medium mb-2">Notes</h4>
              <p className="text-sm bg-gray-50 p-3 rounded-md whitespace-pre-line">{workOrder.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Job Lines Summary */}
      {jobLines.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Job Lines Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {jobLines.map((jobLine) => (
                <div key={jobLine.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {jobLine.status === 'completed' ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : jobLine.status === 'in-progress' ? (
                      <Circle className="h-5 w-5 text-blue-500" />
                    ) : (
                      <Circle className="h-5 w-5 text-gray-400" />
                    )}
                    <div>
                      <p className="font-medium">{jobLine.name}</p>
                      {jobLine.description && (
                        <p className="text-sm text-muted-foreground">{jobLine.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${(jobLine.total_amount || 0).toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">{jobLine.estimated_hours || 0}h</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Financial Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Financial Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Labor Total:</span>
              <span className="font-medium">${totalJobLineAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Parts Total:</span>
              <span className="font-medium">${totalPartsValue.toFixed(2)}</span>
            </div>
            <div className="border-t pt-3">
              <div className="flex justify-between text-lg font-semibold">
                <span>Grand Total:</span>
                <span>${(totalJobLineAmount + totalPartsValue).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
