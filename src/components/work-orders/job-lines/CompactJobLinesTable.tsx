
import React, { useState } from 'react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2 } from 'lucide-react';
import { EditJobLineDialog } from './EditJobLineDialog';

interface CompactJobLinesTableProps {
  jobLines: WorkOrderJobLine[];
  allParts: WorkOrderPart[];
  onUpdate: (jobLine: WorkOrderJobLine) => void;
  onDelete: (jobLineId: string) => void;
  onPartUpdate?: (part: WorkOrderPart) => void;
  onPartDelete?: (partId: string) => void;
  isEditMode?: boolean;
}

export function CompactJobLinesTable({ 
  jobLines, 
  allParts, 
  onUpdate, 
  onDelete, 
  onPartUpdate, 
  onPartDelete, 
  isEditMode = false 
}: CompactJobLinesTableProps) {
  const [editingJobLine, setEditingJobLine] = useState<WorkOrderJobLine | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleEditJobLine = (jobLine: WorkOrderJobLine) => {
    setEditingJobLine(jobLine);
    setIsEditDialogOpen(true);
  };

  const handleJobLineSave = async (updatedJobLine: WorkOrderJobLine) => {
    onUpdate(updatedJobLine);
    setEditingJobLine(null);
    setIsEditDialogOpen(false);
  };

  if (jobLines.length === 0 && allParts.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground text-sm">
        No job lines or parts added yet
      </div>
    );
  }

  // Combine job lines and standalone parts for unified display
  const allItems = [
    ...jobLines.map(jobLine => ({ type: 'jobLine', item: jobLine })),
    ...allParts.filter(part => !part.job_line_id).map(part => ({ type: 'part', item: part }))
  ];

  return (
    <>
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="text-left p-2 font-medium">TYPE</th>
              <th className="text-left p-2 font-medium">DESCRIPTION</th>
              <th className="text-left p-2 font-medium">PART #</th>
              <th className="text-center p-2 font-medium">QTY</th>
              <th className="text-right p-2 font-medium">PRICE</th>
              <th className="text-right p-2 font-medium">RATE</th>
              <th className="text-right p-2 font-medium">HOURS</th>
              <th className="text-right p-2 font-medium">LINE TOTAL</th>
              <th className="text-center p-2 font-medium">STATUS</th>
              {isEditMode && <th className="text-center p-2 font-medium">ACTIONS</th>}
            </tr>
          </thead>
          <tbody>
            {allItems.map((item, index) => {
              const isJobLine = item.type === 'jobLine';
              const jobLine = isJobLine ? item.item as WorkOrderJobLine : null;
              const part = !isJobLine ? item.item as WorkOrderPart : null;
              const relatedParts = isJobLine ? allParts.filter(p => p.job_line_id === jobLine?.id) : [];

              return (
                <React.Fragment key={`${item.type}-${item.item.id}`}>
                  {/* Main row - Job Line or Standalone Part */}
                  <tr className={`border-b hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                    <td className="p-2">
                      <span className="font-medium text-gray-700">
                        {isJobLine ? 'Labor' : 'Parts'}
                      </span>
                    </td>
                    <td className="p-2">
                      <div className="space-y-1">
                        <div className="font-medium text-gray-900">
                          {isJobLine ? jobLine?.name : part?.name}
                        </div>
                        {(isJobLine ? jobLine?.description : part?.description) && (
                          <div className="text-xs text-gray-600 truncate max-w-xs">
                            {isJobLine ? jobLine?.description : part?.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-2 font-mono text-xs">
                      {isJobLine ? '-' : part?.part_number || '-'}
                    </td>
                    <td className="p-2 text-center">
                      {isJobLine ? '-' : part?.quantity || 0}
                    </td>
                    <td className="p-2 text-right font-mono">
                      {isJobLine ? '-' : `$${part?.unit_price?.toFixed(2) || '0.00'}`}
                    </td>
                    <td className="p-2 text-right font-mono">
                      {isJobLine ? `$${jobLine?.labor_rate?.toFixed(2) || '0.00'}` : '-'}
                    </td>
                    <td className="p-2 text-center">
                      {isJobLine ? jobLine?.estimated_hours || 0 : '-'}
                    </td>
                    <td className="p-2 text-right font-mono font-medium">
                      ${isJobLine ? jobLine?.total_amount?.toFixed(2) || '0.00' : part?.total_price?.toFixed(2) || '0.00'}
                    </td>
                    <td className="p-2 text-center">
                      <Badge 
                        variant={
                          (isJobLine ? jobLine?.status : part?.status) === 'completed' || 
                          (isJobLine ? jobLine?.status : part?.status) === 'installed' 
                            ? 'default' : 'secondary'
                        }
                        className="text-xs"
                      >
                        {(isJobLine ? jobLine?.status : part?.status) || 'pending'}
                      </Badge>
                    </td>
                    {isEditMode && (
                      <td className="p-2 text-center">
                        <div className="flex justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => {
                              if (isJobLine && jobLine) {
                                handleEditJobLine(jobLine);
                              } else if (part && onPartUpdate) {
                                onPartUpdate(part);
                              }
                            }}
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                            onClick={() => {
                              if (isJobLine && jobLine) {
                                onDelete(jobLine.id);
                              } else if (part && onPartDelete) {
                                onPartDelete(part.id);
                              }
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    )}
                  </tr>

                  {/* Related parts for job lines */}
                  {isJobLine && relatedParts.map((relatedPart, partIndex) => (
                    <tr 
                      key={`part-${relatedPart.id}`} 
                      className="border-b bg-blue-50 hover:bg-blue-100"
                    >
                      <td className="p-2 pl-6">
                        <span className="text-sm text-gray-600">→ Parts</span>
                      </td>
                      <td className="p-2">
                        <div className="text-sm text-gray-900">{relatedPart.name}</div>
                      </td>
                      <td className="p-2 font-mono text-xs">
                        {relatedPart.part_number || '-'}
                      </td>
                      <td className="p-2 text-center text-sm">
                        {relatedPart.quantity}
                      </td>
                      <td className="p-2 text-right font-mono text-sm">
                        ${relatedPart.unit_price?.toFixed(2) || '0.00'}
                      </td>
                      <td className="p-2 text-center">-</td>
                      <td className="p-2 text-center">-</td>
                      <td className="p-2 text-right font-mono text-sm">
                        ${relatedPart.total_price?.toFixed(2) || '0.00'}
                      </td>
                      <td className="p-2 text-center">
                        <Badge variant="secondary" className="text-xs">
                          {relatedPart.status || 'pending'}
                        </Badge>
                      </td>
                      {isEditMode && (
                        <td className="p-2 text-center">
                          <div className="flex justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => onPartUpdate?.(relatedPart)}
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                              onClick={() => onPartDelete?.(relatedPart.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {editingJobLine && (
        <EditJobLineDialog
          jobLine={editingJobLine}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onUpdate={handleJobLineSave}
        />
      )}
    </>
  );
}
