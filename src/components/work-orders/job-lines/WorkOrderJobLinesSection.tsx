
import React from 'react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wrench } from 'lucide-react';

interface WorkOrderJobLinesSectionProps {
  workOrderId: string;
  jobLines: WorkOrderJobLine[];
  onJobLinesChange: (jobLines: WorkOrderJobLine[]) => void;
  isEditMode: boolean;
}

export function WorkOrderJobLinesSection({
  workOrderId,
  jobLines,
  onJobLinesChange,
  isEditMode
}: WorkOrderJobLinesSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wrench className="h-5 w-5" />
          Job Lines
        </CardTitle>
      </CardHeader>
      <CardContent>
        {jobLines.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No job lines added yet.
          </p>
        ) : (
          <div className="space-y-4">
            {jobLines.map((jobLine) => (
              <div key={jobLine.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{jobLine.name}</h4>
                    {jobLine.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {jobLine.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      {jobLine.estimated_hours && (
                        <span>Hours: {jobLine.estimated_hours}</span>
                      )}
                      {jobLine.labor_rate && (
                        <span>Rate: ${jobLine.labor_rate}</span>
                      )}
                      {jobLine.total_amount && (
                        <span className="font-medium">Total: ${jobLine.total_amount}</span>
                      )}
                    </div>
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
