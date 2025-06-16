
import React, { useState } from 'react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit2, Trash2, Plus } from 'lucide-react';

interface CompactJobLinesTableProps {
  jobLines: WorkOrderJobLine[];
  allParts: WorkOrderPart[];
  onUpdate?: (updatedJobLine: WorkOrderJobLine) => void;
  onDelete?: (jobLineId: string) => void;
  onPartUpdate?: (updatedPart: WorkOrderPart) => void;
  onPartDelete?: (partId: string) => void;
  isEditMode: boolean;
}

export function CompactJobLinesTable({
  jobLines,
  allParts,
  onUpdate,
  onDelete,
  onPartUpdate,
  onPartDelete,
  isEditMode
}: CompactJobLinesTableProps) {
  const handleEditJobLine = (jobLine: WorkOrderJobLine) => {
    console.log('Edit job line clicked:', jobLine.id, jobLine.name);
    // TODO: Implement job line edit dialog
  };

  const handleDeleteJobLine = (jobLineId: string) => {
    if (confirm('Are you sure you want to delete this job line?')) {
      onDelete?.(jobLineId);
    }
  };

  const handleEditPart = (part: WorkOrderPart) => {
    console.log('Edit part clicked:', part.id, part.name);
    // TODO: Implement part edit dialog
  };

  const handleDeletePart = (partId: string) => {
    if (confirm('Are you sure you want to delete this part?')) {
      onPartDelete?.(partId);
    }
  };

  // Combine job lines and parts into a unified display similar to your reference
  const renderUnifiedTable = () => {
    const allItems: Array<{
      id: string;
      type: 'Labor' | 'Parts';
      description: string;
      partNumber?: string;
      quantity: number;
      price: number;
      rate?: number;
      hours?: number;
      lineTotal: number;
      status?: string;
      jobLineId?: string;
    }> = [];

    // Add labor items (job lines)
    jobLines.forEach(jobLine => {
      allItems.push({
        id: jobLine.id,
        type: 'Labor',
        description: jobLine.name + (jobLine.description ? ` - ${jobLine.description}` : ''),
        quantity: jobLine.estimated_hours || 0,
        price: 0,
        rate: jobLine.labor_rate || 0,
        hours: jobLine.estimated_hours || 0,
        lineTotal: jobLine.total_amount || 0,
        status: jobLine.status
      });
    });

    // Add parts
    allParts.forEach(part => {
      allItems.push({
        id: part.id,
        type: 'Parts',
        description: part.name + (part.description ? ` - ${part.description}` : ''),
        partNumber: part.part_number,
        quantity: part.quantity,
        price: part.unit_price,
        lineTotal: part.total_price,
        status: part.status,
        jobLineId: part.job_line_id
      });
    });

    if (allItems.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <p>No labor or parts found</p>
          {isEditMode && (
            <div className="mt-4 space-x-2">
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Labor
              </Button>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Part
              </Button>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="text-left p-3 font-medium text-sm">TYPE</th>
              <th className="text-left p-3 font-medium text-sm">DESCRIPTION</th>
              <th className="text-left p-3 font-medium text-sm">PART #</th>
              <th className="text-center p-3 font-medium text-sm">QTY</th>
              <th className="text-right p-3 font-medium text-sm">PRICE</th>
              <th className="text-right p-3 font-medium text-sm">RATE</th>
              <th className="text-right p-3 font-medium text-sm">HOURS</th>
              <th className="text-right p-3 font-medium text-sm">LINE TOTAL</th>
              {isEditMode && <th className="text-center p-3 font-medium text-sm">ACTIONS</th>}
            </tr>
          </thead>
          <tbody>
            {allItems.map((item, index) => (
              <tr key={item.id} className={`border-b hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                <td className="p-3">
                  <Badge variant={item.type === 'Labor' ? 'default' : 'secondary'} className="text-xs">
                    {item.type}
                  </Badge>
                </td>
                <td className="p-3 text-sm">{item.description}</td>
                <td className="p-3 text-sm text-center">{item.partNumber || '-'}</td>
                <td className="p-3 text-sm text-center">{item.quantity || '-'}</td>
                <td className="p-3 text-sm text-right">
                  {item.type === 'Parts' ? `$${item.price.toFixed(2)}` : '-'}
                </td>
                <td className="p-3 text-sm text-right">
                  {item.type === 'Labor' ? `$${item.rate?.toFixed(2) || '0.00'}` : '-'}
                </td>
                <td className="p-3 text-sm text-right">
                  {item.type === 'Labor' ? (item.hours?.toFixed(1) || '0.0') : '-'}
                </td>
                <td className="p-3 text-sm text-right font-medium">
                  ${item.lineTotal.toFixed(2)}
                </td>
                {isEditMode && (
                  <td className="p-3 text-center">
                    <div className="flex justify-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => item.type === 'Labor' 
                          ? handleEditJobLine(jobLines.find(jl => jl.id === item.id)!)
                          : handleEditPart(allParts.find(p => p.id === item.id)!)
                        }
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => item.type === 'Labor' 
                          ? handleDeleteJobLine(item.id)
                          : handleDeletePart(item.id)
                        }
                      >
                        <Trash2 className="h-3 w-3 text-red-500" />
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

  return (
    <div className="space-y-4">
      {renderUnifiedTable()}
      
      {isEditMode && (
        <div className="flex gap-2 pt-4 border-t">
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Labor Item
          </Button>
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Part
          </Button>
        </div>
      )}
    </div>
  );
}
