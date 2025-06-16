import React, { useState } from 'react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight, Wrench, Package, GripVertical } from 'lucide-react';
import { StatusSelector } from './StatusSelector';
import { jobLineStatusMap, partStatusMap } from '@/types/jobLine';

interface UnifiedItemsTableProps {
  jobLines: WorkOrderJobLine[];
  allParts: WorkOrderPart[];
  onJobLineUpdate?: (jobLine: WorkOrderJobLine) => void;
  onJobLineDelete?: (jobLineId: string) => void;
  onPartUpdate?: (part: WorkOrderPart) => void;
  onPartDelete?: (partId: string) => void;
  isEditMode?: boolean;
  showType: 'overview' | 'parts' | 'labor';
}

export function UnifiedItemsTable({
  jobLines = [],
  allParts = [],
  onJobLineUpdate,
  onJobLineDelete,
  onPartUpdate,
  onPartDelete,
  isEditMode = false,
  showType
}: UnifiedItemsTableProps) {
  const [expandedJobLines, setExpandedJobLines] = useState<Set<string>>(new Set());

  const toggleJobLine = (jobLineId: string) => {
    const newExpanded = new Set(expandedJobLines);
    if (newExpanded.has(jobLineId)) {
      newExpanded.delete(jobLineId);
    } else {
      newExpanded.add(jobLineId);
    }
    setExpandedJobLines(newExpanded);
  };

  const handleStatusChange = (
    id: string,
    newStatus: string,
    type: 'jobLine' | 'part'
  ) => {
    if (type === 'jobLine' && onJobLineUpdate) {
      const jobLine = jobLines.find(jl => jl.id === id);
      if (jobLine) {
        onJobLineUpdate({ ...jobLine, status: newStatus });
      }
    } else if (type === 'part' && onPartUpdate) {
      const part = allParts.find(p => p.id === id);
      if (part) {
        onPartUpdate({ ...part, status: newStatus });
      }
    }
  };

  const renderJobLineRow = (jobLine: WorkOrderJobLine, colorIndex: number) => {
    const isExpanded = expandedJobLines.has(jobLine.id);
    const jobLineParts = allParts.filter(part => part.job_line_id === jobLine.id);
    const hasVisibleParts = jobLineParts.length > 0 && (showType === 'overview' || showType === 'parts');
    
    const statusInfo = jobLineStatusMap[jobLine.status || 'pending'];
    
    return (
      <TableRow key={jobLine.id} colorIndex={colorIndex} className="border-b-2 border-gray-200">
        {/* Drag Handle */}
        <TableCell className="w-8 p-2">
          {isEditMode && (
            <div className="cursor-grab hover:cursor-grabbing p-1 hover:bg-gray-100 rounded">
              <GripVertical className="h-4 w-4 text-gray-400" />
            </div>
          )}
        </TableCell>
        
        {/* Expand/Collapse */}
        <TableCell className="w-8 p-2">
          {hasVisibleParts && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleJobLine(jobLine.id)}
              className="h-6 w-6 p-0"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          )}
        </TableCell>

        {/* Type Icon & Description */}
        <TableCell className="font-medium">
          <div className="flex items-center gap-2">
            <div className="flex-shrink-0">
              <Wrench className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <div className="font-medium text-gray-900">{jobLine.name}</div>
              {jobLine.description && (
                <div className="text-sm text-gray-600 mt-1">{jobLine.description}</div>
              )}
            </div>
          </div>
        </TableCell>

        {/* Part Number - Empty for job lines */}
        <TableCell className="text-gray-400 italic">
          Labor Service
        </TableCell>

        {/* Hours */}
        <TableCell className="text-right">
          {jobLine.estimated_hours ? `${jobLine.estimated_hours}h` : '-'}
        </TableCell>

        {/* Rate */}
        <TableCell className="text-right">
          {jobLine.labor_rate ? `$${jobLine.labor_rate.toFixed(2)}` : '-'}
        </TableCell>

        {/* Total */}
        <TableCell className="text-right font-medium">
          {jobLine.total_amount ? `$${jobLine.total_amount.toFixed(2)}` : '-'}
        </TableCell>

        {/* Status */}
        <TableCell>
          {isEditMode ? (
            <StatusSelector
              currentStatus={jobLine.status || 'pending'}
              type="jobLine"
              onStatusChange={(newStatus) => handleStatusChange(jobLine.id, newStatus, 'jobLine')}
            />
          ) : (
            <Badge className={statusInfo.classes}>
              {statusInfo.label}
            </Badge>
          )}
        </TableCell>
      </TableRow>
    );
  };

  const renderPartRow = (part: WorkOrderPart) => {
    const statusInfo = partStatusMap[part.status || 'pending'];
    
    return (
      <TableRow key={part.id} className="bg-gray-50/50 border-b border-gray-100">
        {/* Drag Handle */}
        <TableCell className="w-8 p-2">
          {isEditMode && (
            <div className="cursor-grab hover:cursor-grabbing p-1 hover:bg-gray-100 rounded">
              <GripVertical className="h-4 w-4 text-gray-400" />
            </div>
          )}
        </TableCell>
        
        {/* Spacer for alignment */}
        <TableCell className="w-8"></TableCell>

        {/* Type Icon & Description */}
        <TableCell>
          <div className="flex items-center gap-2 pl-6">
            <div className="flex-shrink-0">
              <Package className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <div className="font-medium text-gray-900">{part.name}</div>
              {part.description && (
                <div className="text-sm text-gray-600 mt-1">{part.description}</div>
              )}
            </div>
          </div>
        </TableCell>

        {/* Part Number */}
        <TableCell className="font-mono text-sm">
          {part.part_number || '-'}
        </TableCell>

        {/* Quantity */}
        <TableCell className="text-right">
          {part.quantity || 0}
        </TableCell>

        {/* Unit Price */}
        <TableCell className="text-right">
          {part.unit_price ? `$${part.unit_price.toFixed(2)}` : '-'}
        </TableCell>

        {/* Total */}
        <TableCell className="text-right font-medium">
          {part.total_price ? `$${part.total_price.toFixed(2)}` : '-'}
        </TableCell>

        {/* Status */}
        <TableCell>
          {isEditMode ? (
            <StatusSelector
              currentStatus={part.status || 'pending'}
              type="part"
              onStatusChange={(newStatus) => handleStatusChange(part.id, newStatus, 'part')}
            />
          ) : (
            <Badge className={statusInfo.classes}>
              {statusInfo.label}
            </Badge>
          )}
        </TableCell>
      </TableRow>
    );
  };

  const filteredJobLines = showType === 'parts' ? [] : jobLines;
  const filteredParts = showType === 'labor' ? [] : allParts;

  if (filteredJobLines.length === 0 && filteredParts.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No {showType === 'labor' ? 'job lines' : showType === 'parts' ? 'parts' : 'items'} found</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-8"></TableHead> {/* Drag Handle Column */}
            <TableHead className="w-8"></TableHead> {/* Expand/Collapse Column */}
            <TableHead>Description</TableHead>
            <TableHead className="w-32">Part #</TableHead>
            <TableHead className="w-20 text-right">
              {showType === 'parts' ? 'Qty' : 'Hours'}
            </TableHead>
            <TableHead className="w-24 text-right">
              {showType === 'parts' ? 'Unit Price' : 'Rate'}
            </TableHead>
            <TableHead className="w-24 text-right">Total</TableHead>
            <TableHead className="w-32">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* Render Job Lines */}
          {filteredJobLines.map((jobLine, index) => {
            const jobLineParts = allParts.filter(part => part.job_line_id === jobLine.id);
            const isExpanded = expandedJobLines.has(jobLine.id);
            const hasVisibleParts = jobLineParts.length > 0 && (showType === 'overview' || showType === 'parts');

            return (
              <React.Fragment key={jobLine.id}>
                {renderJobLineRow(jobLine, index)}
                
                {/* Render associated parts when expanded */}
                {isExpanded && hasVisibleParts && jobLineParts.map(part => renderPartRow(part))}
              </React.Fragment>
            );
          })}

          {/* Render standalone parts (for parts-only view) */}
          {showType === 'parts' && filteredParts
            .filter(part => !part.job_line_id)
            .map(part => renderPartRow(part))}
        </TableBody>
      </Table>
    </div>
  );
}
