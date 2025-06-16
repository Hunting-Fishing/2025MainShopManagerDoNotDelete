
import React from 'react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2, ArrowRight } from 'lucide-react';

interface CompactJobLinesTableProps {
  jobLines: WorkOrderJobLine[];
  allParts?: WorkOrderPart[];
  onUpdate?: (jobLine: WorkOrderJobLine) => void;
  onDelete?: (jobLineId: string) => void;
  onPartUpdate?: (part: WorkOrderPart) => void;
  onPartDelete?: (partId: string) => void;
  isEditMode?: boolean;
}

export function CompactJobLinesTable({ 
  jobLines, 
  allParts = [], 
  onUpdate, 
  onDelete, 
  onPartUpdate, 
  onPartDelete, 
  isEditMode = false 
}: CompactJobLinesTableProps) {
  // Group parts by job line ID
  const partsByJobLine = allParts.reduce((acc, part) => {
    const jobLineId = part.job_line_id;
    if (jobLineId) {
      if (!acc[jobLineId]) {
        acc[jobLineId] = [];
      }
      acc[jobLineId].push(part);
    }
    return acc;
  }, {} as Record<string, WorkOrderPart[]>);

  if (jobLines.length === 0 && allParts.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground text-sm">
        No job lines or parts added yet
      </div>
    );
  }

  return (
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
          {jobLines.map((jobLine, jobIndex) => {
            const jobLineParts = partsByJobLine[jobLine.id] || [];
            
            return (
              <React.Fragment key={jobLine.id}>
                {/* Job Line Row */}
                <tr className={`border-b hover:bg-gray-50 ${jobIndex % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                  <td className="p-2">
                    <span className="font-medium text-gray-700">Labor</span>
                  </td>
                  <td className="p-2">
                    <div className="space-y-1">
                      <div className="font-medium text-gray-900">{jobLine.name}</div>
                      {jobLine.description && (
                        <div className="text-xs text-gray-600 truncate max-w-xs">
                          {jobLine.description}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-2">-</td>
                  <td className="p-2 text-center">-</td>
                  <td className="p-2 text-center">-</td>
                  <td className="p-2 text-right font-mono">
                    ${jobLine.labor_rate?.toFixed(2) || '0.00'}
                  </td>
                  <td className="p-2 text-right">
                    {jobLine.estimated_hours || 0}
                  </td>
                  <td className="p-2 text-right font-mono font-medium">
                    ${jobLine.total_amount?.toFixed(2) || '0.00'}
                  </td>
                  <td className="p-2 text-center">
                    <Badge 
                      variant={jobLine.status === 'completed' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {jobLine.status || 'pending'}
                    </Badge>
                  </td>
                  {isEditMode && (
                    <td className="p-2 text-center">
                      <div className="flex justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => onUpdate?.(jobLine)}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                          onClick={() => onDelete?.(jobLine.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  )}
                </tr>

                {/* Parts for this Job Line - Indented with arrows */}
                {jobLineParts.map((part) => (
                  <tr key={part.id} className={`border-b hover:bg-gray-50 ${jobIndex % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                    <td className="p-2">
                      <div className="flex items-center">
                        <ArrowRight className="h-3 w-3 text-gray-400 mr-2" />
                        <span className="font-medium text-gray-700">Parts</span>
                      </div>
                    </td>
                    <td className="p-2 pl-8">
                      <div className="space-y-1">
                        <div className="font-medium text-gray-900">{part.name}</div>
                        {part.description && (
                          <div className="text-xs text-gray-600 truncate max-w-xs">
                            {part.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-2 font-mono text-xs">
                      {part.part_number || '-'}
                    </td>
                    <td className="p-2 text-center">
                      {part.quantity}
                    </td>
                    <td className="p-2 text-right font-mono">
                      ${part.unit_price?.toFixed(2) || '0.00'}
                    </td>
                    <td className="p-2 text-center">-</td>
                    <td className="p-2 text-center">-</td>
                    <td className="p-2 text-right font-mono font-medium">
                      ${part.total_price?.toFixed(2) || '0.00'}
                    </td>
                    <td className="p-2 text-center">
                      <Badge 
                        variant={part.status === 'installed' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {part.status || 'pending'}
                      </Badge>
                    </td>
                    {isEditMode && (
                      <td className="p-2 text-center">
                        <div className="flex justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => onPartUpdate?.(part)}
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                            onClick={() => onPartDelete?.(part.id)}
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
  );
}
