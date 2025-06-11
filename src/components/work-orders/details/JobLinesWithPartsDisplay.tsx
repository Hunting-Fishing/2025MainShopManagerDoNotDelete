
import React from 'react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
  return (
    <Card>
      <CardHeader>
        <CardTitle>Job Lines & Parts</CardTitle>
      </CardHeader>
      <CardContent>
        {jobLines.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No job lines found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {jobLines.map((jobLine) => (
              <div key={jobLine.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium">{jobLine.name}</h4>
                  <Badge variant="outline">{jobLine.status}</Badge>
                </div>
                {jobLine.description && (
                  <p className="text-sm text-muted-foreground mb-2">
                    {jobLine.description}
                  </p>
                )}
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Hours: </span>
                    {jobLine.estimated_hours || 0}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Rate: </span>
                    ${jobLine.labor_rate || 0}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total: </span>
                    ${jobLine.total_amount || 0}
                  </div>
                </div>
                {jobLine.parts && jobLine.parts.length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <h5 className="text-sm font-medium mb-2">Parts:</h5>
                    <div className="space-y-1">
                      {jobLine.parts.map((part) => (
                        <div key={part.id} className="text-sm text-muted-foreground">
                          {part.name} - Qty: {part.quantity} - ${part.total_price}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
