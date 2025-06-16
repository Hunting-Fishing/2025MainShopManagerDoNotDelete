
import React from 'react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, GripVertical } from 'lucide-react';

interface UnifiedItemsTableProps {
  jobLines: WorkOrderJobLine[];
  allParts: WorkOrderPart[];
  onJobLineUpdate?: (jobLine: WorkOrderJobLine) => void;
  onJobLineDelete?: (jobLineId: string) => void;
  onPartUpdate?: (part: WorkOrderPart) => void;
  onPartDelete?: (partId: string) => void;
  onReorderJobLines?: (jobLines: WorkOrderJobLine[]) => void;
  onReorderParts?: (parts: WorkOrderPart[]) => void;
  isEditMode: boolean;
  showType: 'labor' | 'parts' | 'overview';
}

export function UnifiedItemsTable({
  jobLines,
  allParts,
  onJobLineUpdate,
  onJobLineDelete,
  onPartUpdate,
  onPartDelete,
  isEditMode,
  showType
}: UnifiedItemsTableProps) {
  const formatCurrency = (amount: number | undefined | null) => {
    if (amount === undefined || amount === null) return '$0.00';
    return `$${amount.toFixed(2)}`;
  };

  const getStatusBadge = (status: string | undefined) => {
    if (!status) return <Badge variant="outline">Unknown</Badge>;
    
    const statusColors: Record<string, string> = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'in-progress': 'bg-blue-100 text-blue-800',
      'completed': 'bg-green-100 text-green-800',
      'on-hold': 'bg-orange-100 text-orange-800',
      'cancelled': 'bg-red-100 text-red-800',
      'installed': 'bg-green-100 text-green-800',
      'ordered': 'bg-blue-100 text-blue-800',
      'received': 'bg-purple-100 text-purple-800'
    };

    const colorClass = statusColors[status.toLowerCase()] || 'bg-gray-100 text-gray-800';
    
    return (
      <Badge variant="outline" className={colorClass}>
        {status}
      </Badge>
    );
  };

  // Show job lines for labor or overview
  const shouldShowJobLines = showType === 'labor' || showType === 'overview';
  // Show parts for parts or overview
  const shouldShowParts = showType === 'parts' || showType === 'overview';

  const hasContent = (shouldShowJobLines && jobLines.length > 0) || (shouldShowParts && allParts.length > 0);

  if (!hasContent) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No items found.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            {isEditMode && <TableHead className="w-12"></TableHead>}
            <TableHead className="font-semibold">Item</TableHead>
            <TableHead className="font-semibold">Description</TableHead>
            <TableHead className="font-semibold text-center">Hours/Qty</TableHead>
            <TableHead className="font-semibold text-center">Rate</TableHead>
            <TableHead className="font-semibold text-center">Total</TableHead>
            <TableHead className="font-semibold text-center">Status</TableHead>
            {isEditMode && <TableHead className="font-semibold text-center">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* Render Job Lines */}
          {shouldShowJobLines && jobLines.map((jobLine) => (
            <TableRow key={jobLine.id} className="hover:bg-gray-50">
              {isEditMode && (
                <TableCell>
                  <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
                </TableCell>
              )}
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  {jobLine.name}
                </div>
              </TableCell>
              <TableCell className="text-gray-600">
                {jobLine.description || 'No description'}
              </TableCell>
              <TableCell className="text-center">
                {jobLine.estimated_hours ? `${jobLine.estimated_hours}h` : '-'}
              </TableCell>
              <TableCell className="text-center">
                {formatCurrency(jobLine.labor_rate)}
              </TableCell>
              <TableCell className="text-center font-medium">
                {formatCurrency(jobLine.total_amount)}
              </TableCell>
              <TableCell className="text-center">
                {getStatusBadge(jobLine.status)}
              </TableCell>
              {isEditMode && (
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onJobLineUpdate?.(jobLine)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onJobLineDelete?.(jobLine.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}

          {/* Render Parts */}
          {shouldShowParts && allParts.map((part) => (
            <TableRow key={part.id} className="hover:bg-gray-50">
              {isEditMode && (
                <TableCell>
                  <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
                </TableCell>
              )}
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  {part.name}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Part #: {part.part_number}
                </div>
              </TableCell>
              <TableCell className="text-gray-600">
                {part.description || 'No description'}
              </TableCell>
              <TableCell className="text-center">
                {part.quantity}
              </TableCell>
              <TableCell className="text-center">
                {formatCurrency(part.unit_price)}
              </TableCell>
              <TableCell className="text-center font-medium">
                {formatCurrency(part.total_price)}
              </TableCell>
              <TableCell className="text-center">
                {getStatusBadge(part.status)}
              </TableCell>
              {isEditMode && (
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onPartUpdate?.(part)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onPartDelete?.(part.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
