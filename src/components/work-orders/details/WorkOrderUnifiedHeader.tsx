
import React from 'react';
import { WorkOrder } from '@/types/workOrder';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { TimeEntry } from '@/types/workOrder';
import { Customer } from '@/types/customer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, DollarSign, User, Car } from 'lucide-react';
import { formatDate } from '@/utils/dateUtils';

interface WorkOrderUnifiedHeaderProps {
  workOrder: WorkOrder;
  customer?: Customer | null;
  jobLines: WorkOrderJobLine[];
  allParts: WorkOrderPart[];
  timeEntries: TimeEntry[];
}

export function WorkOrderUnifiedHeader({
  workOrder,
  customer,
  jobLines,
  allParts,
  timeEntries
}: WorkOrderUnifiedHeaderProps) {
  const totalLaborCost = jobLines.reduce((sum, line) => sum + (line.total_amount || 0), 0);
  const totalPartsCost = allParts.reduce((sum, part) => sum + (part.total_price || 0), 0);
  const totalCost = totalLaborCost + totalPartsCost;

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'in-progress': 'bg-blue-100 text-blue-800 border-blue-200',
      'completed': 'bg-green-100 text-green-800 border-green-200',
      'on-hold': 'bg-orange-100 text-orange-800 border-orange-200',
      'cancelled': 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const customerName = customer?.name || workOrder.customer_name || 'Unknown Customer';
  const vehicleInfo = [
    workOrder.vehicle_year,
    workOrder.vehicle_make,
    workOrder.vehicle_model
  ].filter(Boolean).join(' ') || 'No vehicle info';

  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardContent className="p-6">
        {/* Header Row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-semibold text-gray-900">
                Work Order #{workOrder.id.slice(0, 8)}
              </h1>
              <Badge className={`px-3 py-1 font-medium ${getStatusColor(workOrder.status)}`}>
                {workOrder.status?.charAt(0).toUpperCase() + workOrder.status?.slice(1) || 'Unknown'}
              </Badge>
            </div>
            <p className="text-gray-600 text-sm">
              {workOrder.description || 'No description provided'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="text-right">
              <div className="text-sm text-gray-500">Total Cost</div>
              <div className="text-2xl font-bold text-gray-900">
                ${totalCost.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Customer Info */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">
                {customerName}
              </div>
              <div className="text-sm text-gray-500">Customer</div>
            </div>
          </div>

          {/* Vehicle Info */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="p-2 bg-green-100 rounded-lg">
              <Car className="h-4 w-4 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">
                {vehicleInfo}
              </div>
              <div className="text-sm text-gray-500">Vehicle</div>
            </div>
          </div>

          {/* Created Date */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calendar className="h-4 w-4 text-purple-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900">
                {workOrder.created_at ? formatDate(workOrder.created_at) : 'Unknown'}
              </div>
              <div className="text-sm text-gray-500">Created</div>
            </div>
          </div>

          {/* Job Summary */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Clock className="h-4 w-4 text-orange-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900">
                {jobLines.length} Jobs, {allParts.length} Parts
              </div>
              <div className="text-sm text-gray-500">Items</div>
            </div>
          </div>
        </div>

        {/* Revenue Breakdown */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-gray-900">
                ${totalLaborCost.toFixed(2)}
              </div>
              <div className="text-sm text-gray-500">Labor Revenue</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-900">
                ${totalPartsCost.toFixed(2)}
              </div>
              <div className="text-sm text-gray-500">Parts Revenue</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-blue-600">
                ${totalCost.toFixed(2)}
              </div>
              <div className="text-sm text-gray-500">Total Revenue</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
