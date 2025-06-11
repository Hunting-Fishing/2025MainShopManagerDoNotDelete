
import React, { useState, useEffect } from 'react';
import { WorkOrder } from '@/types/workOrder';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Wrench, 
  Package, 
  DollarSign, 
  Clock, 
  User, 
  Calendar,
  Plus,
  Edit,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { JobLinesGrid } from '../job-lines/JobLinesGrid';
import { getWorkOrderParts } from '@/services/workOrder/workOrderPartsService';

interface PartsAndLaborTabProps {
  workOrder: WorkOrder;
  jobLines: WorkOrderJobLine[];
  onJobLinesChange: (jobLines: WorkOrderJobLine[]) => void;
  isEditMode: boolean;
}

export function PartsAndLaborTab({
  workOrder,
  jobLines,
  onJobLinesChange,
  isEditMode
}: PartsAndLaborTabProps) {
  const [allParts, setAllParts] = useState<WorkOrderPart[]>([]);
  const [isLoadingParts, setIsLoadingParts] = useState(true);

  useEffect(() => {
    fetchParts();
  }, [workOrder.id]);

  const fetchParts = async () => {
    try {
      setIsLoadingParts(true);
      const parts = await getWorkOrderParts(workOrder.id);
      setAllParts(parts);
    } catch (error) {
      console.error('Error fetching parts:', error);
    } finally {
      setIsLoadingParts(false);
    }
  };

  // Calculate totals
  const totalLaborHours = jobLines.reduce((sum, line) => sum + (line.estimated_hours || 0), 0);
  const totalLaborCost = jobLines.reduce((sum, line) => sum + (line.total_amount || 0), 0);
  const totalPartsCount = allParts.length;
  const totalPartsCost = allParts.reduce((sum, part) => sum + part.total_price, 0);
  const grandTotal = totalLaborCost + totalPartsCost;

  // Status calculations
  const completedJobLines = jobLines.filter(line => line.status === 'completed').length;
  const installedParts = allParts.filter(part => part.status === 'installed').length;
  const pendingParts = allParts.filter(part => part.status === 'pending' || part.status === 'ordered').length;

  return (
    <div className="space-y-6">
      {/* Enhanced Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Wrench className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Labor Services</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{jobLines.length}</p>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  {completedJobLines} of {jobLines.length} completed
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <Package className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-700 dark:text-green-300">Parts & Materials</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">{totalPartsCount}</p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  {installedParts} installed, {pendingParts} pending
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500 rounded-lg">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Total Hours</p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{totalLaborHours.toFixed(1)}</p>
                <p className="text-xs text-purple-600 dark:text-purple-400">Estimated labor time</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500 rounded-lg">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-orange-700 dark:text-orange-300">Total Value</p>
                <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">${grandTotal.toFixed(2)}</p>
                <p className="text-xs text-orange-600 dark:text-orange-400">
                  Labor: ${totalLaborCost.toFixed(2)} + Parts: ${totalPartsCost.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Work Order Summary */}
      <Card className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-2">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <CheckCircle className="h-5 w-5 text-emerald-500" />
              Work Order Summary
            </CardTitle>
            <Badge 
              variant={workOrder.status === 'completed' ? 'default' : 'secondary'}
              className={`${
                workOrder.status === 'completed' ? 'bg-emerald-500 hover:bg-emerald-600' :
                workOrder.status === 'in-progress' ? 'bg-blue-500 hover:bg-blue-600' :
                workOrder.status === 'pending' ? 'bg-yellow-500 hover:bg-yellow-600' :
                'bg-gray-500 hover:bg-gray-600'
              } text-white`}
            >
              {workOrder.status?.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Customer Information</span>
              </div>
              <div className="pl-6 space-y-1">
                <p className="font-semibold">{workOrder.customer_name || 'Unknown Customer'}</p>
                {workOrder.customer_phone && (
                  <p className="text-sm text-muted-foreground">{workOrder.customer_phone}</p>
                )}
                {workOrder.customer_email && (
                  <p className="text-sm text-muted-foreground">{workOrder.customer_email}</p>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Timeline</span>
              </div>
              <div className="pl-6 space-y-1">
                <p className="text-sm">
                  <span className="font-medium">Created:</span> {new Date(workOrder.created_at).toLocaleDateString()}
                </p>
                {workOrder.due_date && (
                  <p className="text-sm">
                    <span className="font-medium">Due:</span> {new Date(workOrder.due_date).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Priority & Status</span>
              </div>
              <div className="pl-6 space-y-1">
                <Badge variant="outline" className="mb-1">
                  {workOrder.priority || 'Normal'} Priority
                </Badge>
                <p className="text-sm text-muted-foreground">
                  {workOrder.technician || 'No technician assigned'}
                </p>
              </div>
            </div>
          </div>

          {workOrder.description && (
            <>
              <Separator className="my-4" />
              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-sm text-muted-foreground">{workOrder.description}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Financial Breakdown */}
      <Card className="border-2 border-dashed border-emerald-200 dark:border-emerald-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
            <DollarSign className="h-5 w-5" />
            Financial Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Labor Cost</p>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">${totalLaborCost.toFixed(2)}</p>
              <p className="text-xs text-blue-500 dark:text-blue-500">{totalLaborHours.toFixed(1)} hours</p>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
              <p className="text-sm text-green-600 dark:text-green-400 font-medium">Parts Cost</p>
              <p className="text-2xl font-bold text-green-700 dark:text-green-300">${totalPartsCost.toFixed(2)}</p>
              <p className="text-xs text-green-500 dark:text-green-500">{totalPartsCount} items</p>
            </div>
            <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-950 rounded-lg border-2 border-emerald-200 dark:border-emerald-800">
              <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">Grand Total</p>
              <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-300">${grandTotal.toFixed(2)}</p>
              <p className="text-xs text-emerald-500 dark:text-emerald-500">Including all costs</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Job Lines Grid */}
      <JobLinesGrid
        workOrderId={workOrder.id}
        jobLines={jobLines}
        onUpdate={(updatedJobLine) => {
          const updatedJobLines = jobLines.map(jl => 
            jl.id === updatedJobLine.id ? updatedJobLine : jl
          );
          onJobLinesChange(updatedJobLines);
        }}
        onDelete={(jobLineId) => {
          const updatedJobLines = jobLines.filter(jl => jl.id !== jobLineId);
          onJobLinesChange(updatedJobLines);
        }}
        onJobLinesChange={onJobLinesChange}
        isEditMode={isEditMode}
      />
    </div>
  );
}
