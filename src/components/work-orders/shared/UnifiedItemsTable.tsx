import React from 'react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { TimeEntry } from '@/types/workOrder';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2 } from 'lucide-react';

interface UnifiedItemsTableProps {
  jobLines?: WorkOrderJobLine[];
  allParts?: WorkOrderPart[];
  parts?: WorkOrderPart[];
  timeEntries?: TimeEntry[];
  onJobLineUpdate?: (jobLine: WorkOrderJobLine) => void;
  onJobLineDelete?: (jobLineId: string) => void;
  onPartUpdate?: (part: WorkOrderPart) => void;
  onPartDelete?: (partId: string) => void;
  isEditMode?: boolean;
  showType?: 'overview' | 'jobs' | 'parts' | 'time';
}

export function UnifiedItemsTable({
  jobLines = [],
  allParts = [],
  parts = [],
  timeEntries = [],
  onJobLineUpdate,
  onJobLineDelete,
  onPartUpdate,
  onPartDelete,
  isEditMode = false,
  showType = 'overview'
}: UnifiedItemsTableProps) {
  // Use allParts if provided, otherwise fall back to parts
  const workingParts = allParts.length > 0 ? allParts : parts;

  const renderOverviewTable = () => {
    // Group parts by job_line_id
    const partsByJobLine = workingParts.reduce((acc, part) => {
      const jobLineId = part.job_line_id || 'unassociated';
      if (!acc[jobLineId]) {
        acc[jobLineId] = [];
      }
      acc[jobLineId].push(part);
      return acc;
    }, {} as Record<string, WorkOrderPart[]>);

    const rows: JSX.Element[] = [];

    // Add job lines with their associated parts
    jobLines.forEach((jobLine) => {
      // Add job line row
      rows.push(
        <TableRow key={`job-line-${jobLine.id}`} className="border-b">
          <TableCell className="font-medium">Labor</TableCell>
          <TableCell>{jobLine.name}</TableCell>
          <TableCell>{jobLine.description || '-'}</TableCell>
          <TableCell className="text-right">{jobLine.estimated_hours || 0}</TableCell>
          <TableCell className="text-right">${jobLine.labor_rate || 0}</TableCell>
          <TableCell className="text-right">${jobLine.total_amount || 0}</TableCell>
          <TableCell>
            <Badge variant="outline">{jobLine.status || 'pending'}</Badge>
          </TableCell>
          <TableCell>
            {isEditMode && (
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onJobLineUpdate?.(jobLine)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onJobLineDelete?.(jobLine.id)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            )}
          </TableCell>
        </TableRow>
      );

      // Add associated parts as nested rows
      const associatedParts = partsByJobLine[jobLine.id] || [];
      associatedParts.forEach((part) => {
        rows.push(
          <TableRow key={`part-${part.id}`} className="bg-muted/30">
            <TableCell className="pl-8 text-muted-foreground">Part</TableCell>
            <TableCell className="pl-4">{part.name}</TableCell>
            <TableCell className="pl-4">{part.description || '-'}</TableCell>
            <TableCell className="text-right">{part.quantity}</TableCell>
            <TableCell className="text-right">${part.unit_price || 0}</TableCell>
            <TableCell className="text-right">${part.total_price || (part.quantity * (part.unit_price || 0))}</TableCell>
            <TableCell>
              <Badge variant="outline">{part.status || 'pending'}</Badge>
            </TableCell>
            <TableCell>
              {isEditMode && (
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onPartUpdate?.(part)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onPartDelete?.(part.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              )}
            </TableCell>
          </TableRow>
        );
      });
    });

    // Add unassociated parts in a separate section
    const unassociatedParts = partsByJobLine['unassociated'] || [];
    if (unassociatedParts.length > 0) {
      unassociatedParts.forEach((part) => {
        rows.push(
          <TableRow key={`unassociated-part-${part.id}`} className="border-b">
            <TableCell className="font-medium">Part</TableCell>
            <TableCell>{part.name}</TableCell>
            <TableCell>{part.description || '-'}</TableCell>
            <TableCell className="text-right">{part.quantity}</TableCell>
            <TableCell className="text-right">${part.unit_price || 0}</TableCell>
            <TableCell className="text-right">${part.total_price || (part.quantity * (part.unit_price || 0))}</TableCell>
            <TableCell>
              <Badge variant="outline">{part.status || 'pending'}</Badge>
            </TableCell>
            <TableCell>
              {isEditMode && (
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onPartUpdate?.(part)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onPartDelete?.(part.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              )}
            </TableCell>
          </TableRow>
        );
      });
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Qty/Hours</TableHead>
            <TableHead className="text-right">Rate/Price</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length > 0 ? rows : (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-muted-foreground py-4">
                No job lines or parts found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    );
  };

  const renderJobsTable = () => {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Hours</TableHead>
            <TableHead className="text-right">Rate</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobLines.length > 0 ? (
            jobLines.map((jobLine) => (
              <TableRow key={jobLine.id}>
                <TableCell className="font-medium">{jobLine.name}</TableCell>
                <TableCell>{jobLine.description || '-'}</TableCell>
                <TableCell className="text-right">{jobLine.estimated_hours || 0}</TableCell>
                <TableCell className="text-right">${jobLine.labor_rate || 0}</TableCell>
                <TableCell className="text-right">${jobLine.total_amount || 0}</TableCell>
                <TableCell>
                  <Badge variant="outline">{jobLine.status || 'pending'}</Badge>
                </TableCell>
                <TableCell>
                  {isEditMode && (
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onJobLineUpdate?.(jobLine)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onJobLineDelete?.(jobLine.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground py-4">
                No job lines found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    );
  };

  const renderPartsTable = () => {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Quantity</TableHead>
            <TableHead className="text-right">Unit Price</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {workingParts.length > 0 ? (
            workingParts.map((part) => (
              <TableRow key={part.id}>
                <TableCell className="font-medium">{part.name}</TableCell>
                <TableCell>{part.description || '-'}</TableCell>
                <TableCell className="text-right">{part.quantity}</TableCell>
                <TableCell className="text-right">${part.unit_price || 0}</TableCell>
                <TableCell className="text-right">${part.total_price || (part.quantity * (part.unit_price || 0))}</TableCell>
                <TableCell>
                  <Badge variant="outline">{part.status || 'pending'}</Badge>
                </TableCell>
                <TableCell>
                  {isEditMode && (
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onPartUpdate?.(part)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onPartDelete?.(part.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground py-4">
                No parts found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    );
  };

  const renderTimeTable = () => {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Employee</TableHead>
            <TableHead>Start Time</TableHead>
            <TableHead>End Time</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Billable</TableHead>
            <TableHead>Notes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {timeEntries.length > 0 ? (
            timeEntries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>{entry.employee_name}</TableCell>
                <TableCell>{entry.start_time}</TableCell>
                <TableCell>{entry.end_time || '-'}</TableCell>
                <TableCell>{entry.duration ? `${entry.duration} min` : '-'}</TableCell>
                <TableCell>
                  <Badge variant={entry.billable ? 'default' : 'secondary'}>
                    {entry.billable ? 'Yes' : 'No'}
                  </Badge>
                </TableCell>
                <TableCell>{entry.notes || '-'}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground py-4">
                No time entries found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    );
  };

  // Render based on showType
  switch (showType) {
    case 'overview':
      return renderOverviewTable();
    case 'jobs':
      return renderJobsTable();
    case 'parts':
      return renderPartsTable();
    case 'time':
      return renderTimeTable();
    default:
      return renderOverviewTable();
  }
}
