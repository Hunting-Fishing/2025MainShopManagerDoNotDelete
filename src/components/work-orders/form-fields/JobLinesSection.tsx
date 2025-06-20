
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WorkOrderJobLine } from '@/types/jobLine';

interface JobLinesSectionProps {
  workOrderId: string;
  jobLines: WorkOrderJobLine[];  
  onJobLinesChange: (jobLines: WorkOrderJobLine[]) => void;
  isEditMode?: boolean;
}

export function JobLinesSection({
  workOrderId,
  jobLines,
  onJobLinesChange,
  isEditMode = false
}: JobLinesSectionProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Labor</CardTitle>
      </CardHeader>
      <CardContent>
        {jobLines.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No labor items added to this work order.
          </div>
        ) : (
          <div className="space-y-2">
            {jobLines.map((jobLine) => (
              <div key={jobLine.id} className="p-3 border rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{jobLine.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {jobLine.estimated_hours || 0} hours @ ${jobLine.labor_rate || 0}/hr
                    </p>
                    {jobLine.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {jobLine.description}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      ${(jobLine.total_amount || 0).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
