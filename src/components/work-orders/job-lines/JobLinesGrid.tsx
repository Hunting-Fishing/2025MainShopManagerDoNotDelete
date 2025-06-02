
import React from 'react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { JobLineCard } from './JobLineCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveGrid } from '@/components/ui/responsive-grid';
import { Clock, DollarSign, Wrench } from 'lucide-react';

interface JobLinesGridProps {
  jobLines: WorkOrderJobLine[];
  showSummary?: boolean;
  isEditMode?: boolean;
  onUpdate?: (jobLine: WorkOrderJobLine) => void;
  onDelete?: (jobLineId: string) => void;
}

export function JobLinesGrid({ 
  jobLines, 
  showSummary = true,
  isEditMode = false,
  onUpdate = () => {},
  onDelete = () => {}
}: JobLinesGridProps) {
  const totalHours = jobLines.reduce((sum, line) => sum + (line.estimatedHours || 0), 0);
  const totalAmount = jobLines.reduce((sum, line) => sum + (line.totalAmount || 0), 0);

  if (jobLines.length === 0) {
    return (
      <Card className="border-dashed border-2">
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Wrench className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground mb-2">No Job Lines Found</h3>
          <p className="text-sm text-muted-foreground text-center">
            Job lines will be automatically parsed from the work order description.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Service Details</h3>
        <div className="text-sm text-muted-foreground">
          {jobLines.length} service{jobLines.length !== 1 ? 's' : ''}
        </div>
      </div>

      <ResponsiveGrid
        cols={{ default: 1, md: 2, lg: 3 }}
        gap="md"
      >
        {jobLines.map((jobLine) => (
          <JobLineCard 
            key={jobLine.id} 
            jobLine={jobLine}
            onUpdate={onUpdate}
            onDelete={onDelete}
            isEditMode={isEditMode}
          />
        ))}
      </ResponsiveGrid>

      {showSummary && (totalHours > 0 || totalAmount > 0) && (
        <Card className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <div>
                  <div className="text-sm text-muted-foreground">Total Labor Time</div>
                  <div className="font-semibold">{totalHours.toFixed(1)} hours</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <div>
                  <div className="text-sm text-muted-foreground">Total Labor Cost</div>
                  <div className="font-semibold">${totalAmount.toFixed(2)}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
