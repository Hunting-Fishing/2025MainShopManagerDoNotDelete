
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2 } from 'lucide-react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';

interface ItemsTableRowProps {
  item: WorkOrderJobLine | WorkOrderPart;
  type: 'jobLine' | 'part';
  isEditMode?: boolean;
  onUpdate?: (item: WorkOrderJobLine | WorkOrderPart) => void;
  onDelete?: (id: string) => void;
}

export function ItemsTableRow({ 
  item, 
  type, 
  isEditMode = false, 
  onUpdate, 
  onDelete 
}: ItemsTableRowProps) {
  const isJobLine = type === 'jobLine';
  const jobLine = isJobLine ? item as WorkOrderJobLine : null;
  const part = !isJobLine ? item as WorkOrderPart : null;

  const handleUpdate = (field: string, value: any) => {
    if (onUpdate) {
      onUpdate({ ...item, [field]: value });
    }
  };

  return (
    <tr className="border-b hover:bg-gray-50">
      <td className="px-4 py-3">
        {isEditMode ? (
          <Input
            value={item.name}
            onChange={(e) => handleUpdate('name', e.target.value)}
            className="text-sm"
          />
        ) : (
          <span className="font-medium">{item.name}</span>
        )}
      </td>
      
      <td className="px-4 py-3">
        {isEditMode ? (
          <Input
            value={item.description || ''}
            onChange={(e) => handleUpdate('description', e.target.value)}
            className="text-sm"
          />
        ) : (
          <span className="text-gray-600">{item.description || '-'}</span>
        )}
      </td>
      
      {isJobLine && (
        <>
          <td className="px-4 py-3 text-right">
            {isEditMode ? (
              <Input
                type="number"
                value={jobLine?.estimated_hours || 0}
                onChange={(e) => handleUpdate('estimated_hours', parseFloat(e.target.value) || 0)}
                className="text-sm w-20"
                step="0.1"
              />
            ) : (
              <span>{jobLine?.estimated_hours || 0} hrs</span>
            )}
          </td>
          <td className="px-4 py-3 text-right">
            {isEditMode ? (
              <Input
                type="number"
                value={jobLine?.labor_rate || 0}
                onChange={(e) => handleUpdate('labor_rate', parseFloat(e.target.value) || 0)}
                className="text-sm w-24"
                step="0.01"
              />
            ) : (
              <span>${jobLine?.labor_rate || 0}</span>
            )}
          </td>
        </>
      )}
      
      {!isJobLine && (
        <>
          <td className="px-4 py-3 text-center">
            {isEditMode ? (
              <Input
                type="number"
                value={part?.quantity || 1}
                onChange={(e) => handleUpdate('quantity', parseInt(e.target.value) || 1)}
                className="text-sm w-16"
                min="1"
              />
            ) : (
              <span>{part?.quantity || 1}</span>
            )}
          </td>
          <td className="px-4 py-3 text-right">
            {isEditMode ? (
              <Input
                type="number"
                value={part?.unit_price || 0}
                onChange={(e) => handleUpdate('unit_price', parseFloat(e.target.value) || 0)}
                className="text-sm w-24"
                step="0.01"
              />
            ) : (
              <span>${part?.unit_price || 0}</span>
            )}
          </td>
        </>
      )}
      
      <td className="px-4 py-3">
        {item.status && (
          <Badge variant="secondary" className="text-xs">
            {item.status}
          </Badge>
        )}
      </td>
      
      {isEditMode && (
        <td className="px-4 py-3">
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete?.(item.id)}
              className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </td>
      )}
    </tr>
  );
}
