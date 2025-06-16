
import React from 'react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { TimeEntry } from '@/types/workOrder';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Clock, Package, Wrench } from 'lucide-react';

interface UnifiedItemsTableProps {
  // Job Lines
  jobLines?: WorkOrderJobLine[];
  onJobLineUpdate?: (jobLine: WorkOrderJobLine) => void;
  onJobLineDelete?: (jobLineId: string) => void;
  
  // Parts
  parts?: WorkOrderPart[];
  allParts?: WorkOrderPart[];
  onPartUpdate?: (part: WorkOrderPart) => void;
  onPartDelete?: (partId: string) => void;
  
  // Time Entries
  timeEntries?: TimeEntry[];
  onTimeEntryUpdate?: (entry: TimeEntry) => void;
  onTimeEntryDelete?: (entryId: string) => void;
  
  // Display control
  showType: 'overview' | 'jobs' | 'parts' | 'time';
  isEditMode?: boolean;
}

export function UnifiedItemsTable({
  jobLines = [],
  parts = [],
  allParts = [],
  timeEntries = [],
  onJobLineUpdate,
  onJobLineDelete,
  onPartUpdate,
  onPartDelete,
  onTimeEntryUpdate,
  onTimeEntryDelete,
  showType,
  isEditMode = false
}: UnifiedItemsTableProps) {
  const renderJobLinesTable = () => {
    if (!jobLines.length) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <Wrench className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p className="text-sm">No job lines added yet</p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-3 font-medium">TYPE</th>
              <th className="text-left p-3 font-medium">DESCRIPTION</th>
              <th className="text-right p-3 font-medium">HOURS</th>
              <th className="text-right p-3 font-medium">RATE</th>
              <th className="text-right p-3 font-medium">LINE TOTAL</th>
              {isEditMode && <th className="text-center p-3 font-medium">ACTIONS</th>}
            </tr>
          </thead>
          <tbody>
            {jobLines.map((jobLine) => (
              <tr key={jobLine.id} className="border-b hover:bg-muted/25">
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <Wrench className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">Labor</span>
                  </div>
                </td>
                <td className="p-3">
                  <div>
                    <div className="font-medium">{jobLine.name}</div>
                    {jobLine.description && (
                      <div className="text-sm text-muted-foreground">{jobLine.description}</div>
                    )}
                  </div>
                </td>
                <td className="p-3 text-right">{jobLine.estimated_hours || 0}</td>
                <td className="p-3 text-right">${jobLine.labor_rate || 0}</td>
                <td className="p-3 text-right font-medium">${jobLine.total_amount || 0}</td>
                {isEditMode && (
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onJobLineUpdate?.(jobLine)}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onJobLineDelete?.(jobLine.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderPartsTable = () => {
    const partsToShow = showType === 'parts' ? parts : allParts;
    
    if (!partsToShow.length) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p className="text-sm">No parts added yet</p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-3 font-medium">TYPE</th>
              <th className="text-left p-3 font-medium">DESCRIPTION</th>
              <th className="text-left p-3 font-medium">PART #</th>
              <th className="text-right p-3 font-medium">QTY</th>
              <th className="text-right p-3 font-medium">PRICE</th>
              <th className="text-right p-3 font-medium">LINE TOTAL</th>
              {isEditMode && <th className="text-center p-3 font-medium">ACTIONS</th>}
            </tr>
          </thead>
          <tbody>
            {partsToShow.map((part) => (
              <tr key={part.id} className="border-b hover:bg-muted/25">
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Part</span>
                  </div>
                </td>
                <td className="p-3">
                  <div>
                    <div className="font-medium">{part.name}</div>
                    {part.description && (
                      <div className="text-sm text-muted-foreground">{part.description}</div>
                    )}
                  </div>
                </td>
                <td className="p-3 text-sm font-mono">{part.part_number}</td>
                <td className="p-3 text-right">{part.quantity}</td>
                <td className="p-3 text-right">${part.unit_price}</td>
                <td className="p-3 text-right font-medium">${part.total_price}</td>
                {isEditMode && (
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onPartUpdate?.(part)}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onPartDelete?.(part.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderTimeEntriesTable = () => {
    if (!timeEntries.length) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p className="text-sm">No time entries recorded yet</p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-3 font-medium">EMPLOYEE</th>
              <th className="text-left p-3 font-medium">START TIME</th>
              <th className="text-left p-3 font-medium">END TIME</th>
              <th className="text-right p-3 font-medium">DURATION</th>
              <th className="text-center p-3 font-medium">BILLABLE</th>
              {isEditMode && <th className="text-center p-3 font-medium">ACTIONS</th>}
            </tr>
          </thead>
          <tbody>
            {timeEntries.map((entry) => (
              <tr key={entry.id} className="border-b hover:bg-muted/25">
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-orange-600" />
                    <span className="text-sm font-medium">{entry.employee_name}</span>
                  </div>
                </td>
                <td className="p-3 text-sm">{entry.start_time}</td>
                <td className="p-3 text-sm">{entry.end_time || 'In progress'}</td>
                <td className="p-3 text-right">{entry.duration} min</td>
                <td className="p-3 text-center">
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                    entry.billable 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {entry.billable ? 'Billable' : 'Non-billable'}
                  </span>
                </td>
                {isEditMode && (
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onTimeEntryUpdate?.(entry)}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onTimeEntryDelete?.(entry.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderOverviewTable = () => {
    const hasJobLines = jobLines.length > 0;
    const hasParts = allParts.length > 0;
    
    if (!hasJobLines && !hasParts) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <div className="flex justify-center gap-2 mb-4">
            <Wrench className="h-12 w-12 text-gray-300" />
            <Package className="h-12 w-12 text-gray-300" />
          </div>
          <p className="text-sm">No labor or parts added yet</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {hasJobLines && (
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              Labor
            </h4>
            {renderJobLinesTable()}
          </div>
        )}
        
        {hasParts && (
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Package className="h-4 w-4" />
              Parts
            </h4>
            {renderPartsTable()}
          </div>
        )}
      </div>
    );
  };

  // Render based on showType
  switch (showType) {
    case 'jobs':
      return renderJobLinesTable();
    case 'parts':
      return renderPartsTable();
    case 'time':
      return renderTimeEntriesTable();
    case 'overview':
    default:
      return renderOverviewTable();
  }
}
