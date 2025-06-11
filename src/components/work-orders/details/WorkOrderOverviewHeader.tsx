
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { WorkOrder } from '@/types/workOrder';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { 
  Wrench, 
  Package, 
  DollarSign, 
  Clock, 
  AlertTriangle,
  Calculator,
  TrendingUp,
  Timer
} from 'lucide-react';

interface WorkOrderOverviewHeaderProps {
  workOrder: WorkOrder;
  jobLines: WorkOrderJobLine[];
  allParts: WorkOrderPart[];
}

export function WorkOrderOverviewHeader({ 
  workOrder, 
  jobLines, 
  allParts 
}: WorkOrderOverviewHeaderProps) {
  // Calculate metrics
  const totalJobs = jobLines.length;
  const totalParts = allParts.length;
  
  // Parts financial calculations
  const partsCost = allParts.reduce((sum, part) => sum + (part.supplierCost * part.quantity), 0);
  const partsRetail = allParts.reduce((sum, part) => sum + (part.customerPrice * part.quantity), 0);
  const partsMarkup = partsRetail - partsCost;
  const markupPercentage = partsCost > 0 ? ((partsMarkup / partsCost) * 100) : 0;
  
  // Time calculations
  const estimatedHoursTotal = jobLines.reduce((sum, job) => sum + (job.estimatedHours || 0), 0);
  const totalLaborCost = jobLines.reduce((sum, job) => sum + (job.totalAmount || 0), 0);
  
  // Job lines without parts
  const jobLinesWithoutParts = jobLines.filter(job => 
    !job.parts || job.parts.length === 0
  );
  const jobsWithoutPartsCount = jobLinesWithoutParts.length;
  
  // Overall work order totals
  const grandTotal = totalLaborCost + partsRetail;

  return (
    <div className="space-y-4">
      {/* Alert for jobs without parts */}
      {jobsWithoutPartsCount > 0 && (
        <Card className="border-pink-200 bg-pink-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-pink-800">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">
                {jobsWithoutPartsCount} job line{jobsWithoutPartsCount !== 1 ? 's' : ''} without parts
              </span>
              <Badge variant="outline" className="bg-pink-100 text-pink-800 border-pink-300">
                Attention Required
              </Badge>
            </div>
            <div className="mt-2 text-sm text-pink-700">
              The following job lines don't have any parts assigned:
            </div>
            <div className="mt-1 flex flex-wrap gap-1">
              {jobLinesWithoutParts.map(job => (
                <Badge key={job.id} variant="outline" className="bg-pink-100 text-pink-800 border-pink-300">
                  {job.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main metrics grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {/* Jobs Overview */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Wrench className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-slate-600">Total Jobs</span>
            </div>
            <div className="text-2xl font-bold text-slate-900">{totalJobs}</div>
            {jobsWithoutPartsCount > 0 && (
              <div className="text-xs text-pink-600 mt-1">
                {jobsWithoutPartsCount} without parts
              </div>
            )}
          </CardContent>
        </Card>

        {/* Parts Count */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Package className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium text-slate-600">Total Parts</span>
            </div>
            <div className="text-2xl font-bold text-slate-900">{totalParts}</div>
            <div className="text-xs text-slate-500 mt-1">
              Across all jobs
            </div>
          </CardContent>
        </Card>

        {/* Parts Cost */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-slate-600">Parts Cost</span>
            </div>
            <div className="text-2xl font-bold text-slate-900">${partsCost.toFixed(2)}</div>
            <div className="text-xs text-slate-500 mt-1">
              Supplier cost
            </div>
          </CardContent>
        </Card>

        {/* Parts Retail */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-slate-600">Parts Retail</span>
            </div>
            <div className="text-2xl font-bold text-slate-900">${partsRetail.toFixed(2)}</div>
            <div className="text-xs text-green-600 mt-1">
              +${partsMarkup.toFixed(2)} ({markupPercentage.toFixed(1)}%)
            </div>
          </CardContent>
        </Card>

        {/* Estimated Hours */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-slate-600">Est. Hours</span>
            </div>
            <div className="text-2xl font-bold text-slate-900">{estimatedHoursTotal.toFixed(1)}</div>
            <div className="text-xs text-slate-500 mt-1">
              Total estimated
            </div>
          </CardContent>
        </Card>

        {/* Labor Total */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calculator className="h-4 w-4 text-indigo-600" />
              <span className="text-sm font-medium text-slate-600">Labor Total</span>
            </div>
            <div className="text-2xl font-bold text-slate-900">${totalLaborCost.toFixed(2)}</div>
            <div className="text-xs text-slate-500 mt-1">
              All job lines
            </div>
          </CardContent>
        </Card>

        {/* Grand Total */}
        <Card className="border-slate-300 bg-slate-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Timer className="h-4 w-4 text-slate-700" />
              <span className="text-sm font-medium text-slate-700">Grand Total</span>
            </div>
            <div className="text-2xl font-bold text-slate-900">${grandTotal.toFixed(2)}</div>
            <div className="text-xs text-slate-600 mt-1">
              Labor + Parts
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
