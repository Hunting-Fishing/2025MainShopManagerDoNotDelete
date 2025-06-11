
import React from 'react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, Wrench, Clock, DollarSign } from 'lucide-react';
import { JobLinePartsDisplay } from '../parts/JobLinePartsDisplay';

interface JobLinesWithPartsDisplayProps {
  workOrderId: string;
  jobLines: WorkOrderJobLine[];
  onJobLinesChange: (jobLines: WorkOrderJobLine[]) => void;
  isEditMode: boolean;
}

export function JobLinesWithPartsDisplay({
  workOrderId,
  jobLines,
  onJobLinesChange,
  isEditMode
}: JobLinesWithPartsDisplayProps) {
  if (jobLines.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Wrench className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No Job Lines</h3>
          <p className="text-muted-foreground">
            No job lines have been added to this work order yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Job Lines & Associated Parts</h2>
      
      {jobLines.map((jobLine) => (
        <Card key={jobLine.id} className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                {jobLine.name}
              </CardTitle>
              <Badge variant="outline" className="ml-auto">
                {jobLine.status}
              </Badge>
            </div>
            {jobLine.description && (
              <p className="text-sm text-muted-foreground">{jobLine.description}</p>
            )}
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Job Line Details */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-xs text-muted-foreground">Estimated Hours</p>
                  <p className="font-medium">{jobLine.estimatedHours || 0}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-xs text-muted-foreground">Labor Rate</p>
                  <p className="font-medium">${jobLine.laborRate || 0}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-purple-600" />
                <div>
                  <p className="text-xs text-muted-foreground">Total Amount</p>
                  <p className="font-medium">${jobLine.totalAmount || 0}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-orange-600" />
                <div>
                  <p className="text-xs text-muted-foreground">Parts Count</p>
                  <p className="font-medium">{jobLine.parts?.length || 0}</p>
                </div>
              </div>
            </div>

            {/* Associated Parts */}
            {jobLine.parts && jobLine.parts.length > 0 ? (
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Associated Parts ({jobLine.parts.length})
                </h4>
                <JobLinePartsDisplay
                  parts={jobLine.parts}
                  isEditMode={isEditMode}
                />
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No parts associated with this job line</p>
              </div>
            )}

            {jobLine.notes && (
              <div className="p-3 bg-yellow-50 rounded-lg">
                <p className="text-sm font-medium text-yellow-800">Notes:</p>
                <p className="text-sm text-yellow-700">{jobLine.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
