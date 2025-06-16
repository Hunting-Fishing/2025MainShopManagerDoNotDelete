import React from 'react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface UnifiedItemsTableProps {
  jobLines: WorkOrderJobLine[];
  allParts: WorkOrderPart[];
  onJobLineUpdate?: (jobLine: WorkOrderJobLine) => void;
  onJobLineDelete?: (jobLineId: string) => void;
  onPartUpdate?: (part: WorkOrderPart) => void;
  onPartDelete?: (partId: string) => void;
  isEditMode?: boolean;
  showType?: 'overview' | 'detailed';
}

export function UnifiedItemsTable({
  jobLines,
  allParts,
  onJobLineUpdate,
  onJobLineDelete,
  onPartUpdate,
  onPartDelete,
  isEditMode = false,
  showType = 'overview'
}: UnifiedItemsTableProps) {

  const renderOverviewTable = () => {
    const rows: React.ReactNode[] = [];

    // Group parts by job_line_id
    const partsByJobLine = allParts.reduce((acc, part) => {
      const jobLineId = part.job_line_id || 'unassociated';
      if (!acc[jobLineId]) acc[jobLineId] = [];
      acc[jobLineId].push(part);
      return acc;
    }, {} as Record<string, WorkOrderPart[]>);

    // Render each job line with its associated parts
    jobLines.forEach((jobLine) => {
      // Job line row
      rows.push(
        <tr key={`job-line-${jobLine.id}`} className="border-b">
          <td className="px-4 py-3 font-medium text-blue-600">Labor</td>
          <td className="px-4 py-3">{jobLine.name}</td>
          <td className="px-4 py-3 text-center">-</td>
          <td className="px-4 py-3 text-center">-</td>
          <td className="px-4 py-3 text-center">-</td>
          <td className="px-4 py-3 text-center">${jobLine.labor_rate || 0}</td>
          <td className="px-4 py-3 text-center">{jobLine.estimated_hours || 0}</td>
          <td className="px-4 py-3 text-right font-medium">${jobLine.total_amount || 0}</td>
          {isEditMode && (
            <td className="px-4 py-3">
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
            </td>
          )}
        </tr>
      );

      // Associated parts for this job line (indented)
      const associatedParts = partsByJobLine[jobLine.id] || [];
      associatedParts.forEach((part) => {
        rows.push(
          <tr key={`part-${part.id}`} className="border-b bg-gray-50">
            <td className="px-8 py-2 text-sm text-gray-600 pl-12">Parts</td>
            <td className="px-4 py-2 text-sm pl-8">{part.name}</td>
            <td className="px-4 py-2 text-center text-sm">{part.part_number || '-'}</td>
            <td className="px-4 py-2 text-center text-sm">{part.quantity || 0}</td>
            <td className="px-4 py-2 text-center text-sm">${part.unit_price || 0}</td>
            <td className="px-4 py-2 text-center text-sm">-</td>
            <td className="px-4 py-2 text-center text-sm">-</td>
            <td className="px-4 py-2 text-right text-sm font-medium">
              ${((part.quantity || 0) * (part.unit_price || 0)).toFixed(2)}
            </td>
            {isEditMode && (
              <td className="px-4 py-2">
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onPartUpdate?.(part)}
                  >
                    <Edit2 className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onPartDelete?.(part.id)}
                  >
                    <Trash2 className="h-3 w-3 text-red-500" />
                  </Button>
                </div>
              </td>
            )}
          </tr>
        );
      });
    });

    // Render unassociated parts in a separate section
    const unassociatedParts = partsByJobLine['unassociated'] || [];
    if (unassociatedParts.length > 0) {
      unassociatedParts.forEach((part) => {
        rows.push(
          <tr key={`unassociated-part-${part.id}`} className="border-b">
            <td className="px-4 py-3 font-medium text-green-600">Parts</td>
            <td className="px-4 py-3">{part.name}</td>
            <td className="px-4 py-3 text-center">{part.part_number || '-'}</td>
            <td className="px-4 py-3 text-center">{part.quantity || 0}</td>
            <td className="px-4 py-3 text-center">${part.unit_price || 0}</td>
            <td className="px-4 py-3 text-center">-</td>
            <td className="px-4 py-3 text-center">-</td>
            <td className="px-4 py-3 text-right font-medium">
              ${((part.quantity || 0) * (part.unit_price || 0)).toFixed(2)}
            </td>
            {isEditMode && (
              <td className="px-4 py-3">
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
              </td>
            )}
          </tr>
        );
      });
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b-2">
              <th className="px-4 py-3 text-left font-semibold">TYPE</th>
              <th className="px-4 py-3 text-left font-semibold">DESCRIPTION</th>
              <th className="px-4 py-3 text-center font-semibold">PART #</th>
              <th className="px-4 py-3 text-center font-semibold">QTY</th>
              <th className="px-4 py-3 text-center font-semibold">PRICE</th>
              <th className="px-4 py-3 text-center font-semibold">RATE</th>
              <th className="px-4 py-3 text-center font-semibold">HOURS</th>
              <th className="px-4 py-3 text-right font-semibold">LINE TOTAL</th>
              {isEditMode && <th className="px-4 py-3 text-center font-semibold">ACTIONS</th>}
            </tr>
          </thead>
          <tbody>
            {rows.length > 0 ? rows : (
              <tr>
                <td 
                  colSpan={isEditMode ? 9 : 8} 
                  className="px-4 py-8 text-center text-gray-500"
                >
                  No labor or parts added yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  const renderDetailedView = () => {
    return (
      <div className="space-y-6">
        {/* Job Lines Section */}
        {jobLines.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Labor Items</h3>
            <div className="space-y-3">
              {jobLines.map((jobLine) => (
                <div key={jobLine.id} className="bg-white border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{jobLine.name}</h4>
                        <Badge variant="outline">
                          {jobLine.status || 'pending'}
                        </Badge>
                      </div>
                      {jobLine.description && (
                        <p className="text-sm text-gray-600 mb-2">
                          {jobLine.description}
                        </p>
                      )}
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Hours: </span>
                          {jobLine.estimated_hours || 0}
                        </div>
                        <div>
                          <span className="text-gray-500">Rate: </span>
                          ${jobLine.labor_rate || 0}
                        </div>
                        <div>
                          <span className="text-gray-500">Total: </span>
                          ${jobLine.total_amount || 0}
                        </div>
                      </div>
                    </div>
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
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Parts Section */}
        {allParts.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Parts</h3>
            <div className="space-y-3">
              {allParts.map((part) => (
                <div key={part.id} className="bg-white border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium">{part.name}</h4>
                      {part.description && (
                        <p className="text-sm text-gray-600 mb-2">
                          {part.description}
                        </p>
                      )}
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Part #: </span>
                          {part.part_number || '-'}
                        </div>
                        <div>
                          <span className="text-gray-500">Qty: </span>
                          {part.quantity || 0}
                        </div>
                        <div>
                          <span className="text-gray-500">Price: </span>
                          ${part.unit_price || 0}
                        </div>
                        <div>
                          <span className="text-gray-500">Total: </span>
                          ${((part.quantity || 0) * (part.unit_price || 0)).toFixed(2)}
                        </div>
                      </div>
                    </div>
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
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {jobLines.length === 0 && allParts.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No labor or parts added yet
          </div>
        )}
      </div>
    );
  };

  return showType === 'overview' ? renderOverviewTable() : renderDetailedView();
}
