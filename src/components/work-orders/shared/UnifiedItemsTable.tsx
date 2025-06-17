
import React, { useMemo } from 'react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { JobLineRow } from '../job-lines/JobLineRow';
import { EnhancedPartRow } from '../parts/EnhancedPartRow';
import { WorkOrderTotals } from './WorkOrderTotals';

interface UnifiedItemsTableProps {
  jobLines: WorkOrderJobLine[];
  allParts: WorkOrderPart[];
  onJobLineUpdate?: (updatedJobLine: WorkOrderJobLine) => void;
  onJobLineDelete?: (jobLineId: string) => void;
  onPartUpdate?: (updatedPart: WorkOrderPart) => void;
  onPartDelete?: (partId: string) => void;
  onReorderJobLines?: (reorderedJobLines: WorkOrderJobLine[]) => void;
  onReorderParts?: (reorderedParts: WorkOrderPart[]) => void;
  isEditMode?: boolean;
  showType?: 'all' | 'joblines' | 'parts';
}

export function UnifiedItemsTable({
  jobLines = [],
  allParts = [],
  onJobLineUpdate,
  onJobLineDelete,
  onPartUpdate,
  onPartDelete,
  isEditMode = false,
  showType = 'all'
}: UnifiedItemsTableProps) {
  
  // Group parts by job line for better organization
  const partsByJobLine = useMemo(() => {
    const grouped: Record<string, WorkOrderPart[]> = {};
    const unassigned: WorkOrderPart[] = [];
    
    allParts.forEach(part => {
      if (part.job_line_id) {
        if (!grouped[part.job_line_id]) {
          grouped[part.job_line_id] = [];
        }
        grouped[part.job_line_id].push(part);
      } else {
        unassigned.push(part);
      }
    });
    
    return { grouped, unassigned };
  }, [allParts]);

  const showJobLines = showType === 'all' || showType === 'joblines';
  const showParts = showType === 'all' || showType === 'parts';

  if (jobLines.length === 0 && allParts.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No job lines or parts found for this work order.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Job Lines Table */}
      {showJobLines && jobLines.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Labor & Jobs ({jobLines.length})</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8"></TableHead>
                <TableHead>Job Line</TableHead>
                <TableHead className="text-center">Hours</TableHead>
                <TableHead className="text-center">Rate</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Status</TableHead>
                {isEditMode && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobLines.map((jobLine, index) => (
                <JobLineRow
                  key={jobLine.id}
                  jobLine={jobLine}
                  associatedParts={partsByJobLine.grouped[jobLine.id] || []}
                  isEditMode={isEditMode}
                  onEdit={onJobLineUpdate}
                  onDelete={onJobLineDelete}
                  colorIndex={index}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Unassigned Parts Table */}
      {showParts && partsByJobLine.unassigned.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">
            Parts & Inventory ({partsByJobLine.unassigned.length})
          </h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8"></TableHead>
                <TableHead>Part</TableHead>
                <TableHead className="text-center">Qty</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Status</TableHead>
                {isEditMode && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {partsByJobLine.unassigned.map((part, index) => (
                <EnhancedPartRow
                  key={part.id}
                  part={part}
                  isEditMode={isEditMode}
                  onEdit={onPartUpdate}
                  onDelete={onPartDelete}
                  colorIndex={index}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* All Parts Table (when showing parts only) */}
      {showType === 'parts' && partsByJobLine.unassigned.length === 0 && allParts.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">All Parts ({allParts.length})</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8"></TableHead>
                <TableHead>Part</TableHead>
                <TableHead className="text-center">Qty</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Status</TableHead>
                {isEditMode && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {allParts.map((part, index) => (
                <EnhancedPartRow
                  key={part.id}
                  part={part}
                  isEditMode={isEditMode}
                  onEdit={onPartUpdate}
                  onDelete={onPartDelete}
                  colorIndex={index}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Totals Summary */}
      {(jobLines.length > 0 || allParts.length > 0) && (
        <div className="flex justify-end">
          <WorkOrderTotals jobLines={jobLines} allParts={allParts} />
        </div>
      )}
    </div>
  );
}
