
import React, { useState } from 'react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { jobLineStatusMap } from '@/types/jobLine';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, Edit, Package } from 'lucide-react';
import { EditJobLineDialog } from './EditJobLineDialog';
import { JobLinePartsDisplay } from '../parts/JobLinePartsDisplay';
import { AddPartsDialog } from '../parts/AddPartsDialog';

interface JobLinesTableProps {
  jobLines: WorkOrderJobLine[];
  isEditMode?: boolean;
  onUpdate?: (jobLine: WorkOrderJobLine) => void;
  onDelete?: (jobLineId: string) => void;
  onAddParts?: (jobLineId: string, parts: any[]) => void;
  onRemovePart?: (partId: string) => void;
}

export function JobLinesTable({ 
  jobLines, 
  isEditMode = false,
  onUpdate = () => {},
  onDelete = () => {},
  onAddParts,
  onRemovePart
}: JobLinesTableProps) {
  const [editingJobLine, setEditingJobLine] = useState<WorkOrderJobLine | null>(null);
  const [addingPartsJobLineId, setAddingPartsJobLineId] = useState<string | null>(null);

  const handleEditSave = (updatedJobLine: WorkOrderJobLine) => {
    onUpdate(updatedJobLine);
    setEditingJobLine(null);
  };

  const handlePartsAdded = () => {
    setAddingPartsJobLineId(null);
    // Trigger refresh of job lines to show new parts
    console.log('Parts added, refreshing...');
  };

  return (
    <>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Hours</TableHead>
              <TableHead className="text-right">Rate</TableHead>
              <TableHead className="text-right">Labor</TableHead>
              <TableHead className="text-right">Parts</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Status</TableHead>
              {isEditMode && <TableHead className="w-[120px]">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobLines.map((jobLine) => {
              const statusInfo = jobLineStatusMap[jobLine.status] || jobLineStatusMap.pending;
              const partsTotal = jobLine.parts?.reduce((total, part) => 
                total + (part.customerPrice * part.quantity), 0) || 0;
              const totalWithParts = (jobLine.totalAmount || 0) + partsTotal;
              
              return (
                <React.Fragment key={jobLine.id}>
                  <TableRow>
                    <TableCell>
                      <div>
                        <div className="font-medium">{jobLine.name}</div>
                        {jobLine.description && (
                          <div className="text-sm text-muted-foreground mt-1">
                            {jobLine.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {jobLine.category && (
                        <Badge variant="outline" className="text-xs">
                          {jobLine.category}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {jobLine.estimatedHours?.toFixed(1) || '0.0'}
                    </TableCell>
                    <TableCell className="text-right">
                      ${jobLine.laborRate?.toFixed(2) || '0.00'}
                    </TableCell>
                    <TableCell className="text-right">
                      ${jobLine.totalAmount?.toFixed(2) || '0.00'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {jobLine.parts && jobLine.parts.length > 0 && (
                          <Package className="h-4 w-4 text-blue-600" />
                        )}
                        ${partsTotal.toFixed(2)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium text-green-600">
                      ${totalWithParts.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusInfo.classes}>
                        {statusInfo.label}
                      </Badge>
                    </TableCell>
                    {isEditMode && (
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setAddingPartsJobLineId(jobLine.id)}
                            title="Add Parts"
                          >
                            <Package className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingJobLine(jobLine)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(jobLine.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                  
                  {/* Parts row - only show if there are parts */}
                  {jobLine.parts && jobLine.parts.length > 0 && (
                    <TableRow>
                      <TableCell colSpan={isEditMode ? 9 : 8} className="p-0">
                        <div className="pl-8 pr-4 py-2 bg-muted/30">
                          <JobLinePartsDisplay 
                            parts={jobLine.parts}
                            onRemovePart={onRemovePart}
                            isEditMode={isEditMode}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      {editingJobLine && (
        <EditJobLineDialog
          jobLine={editingJobLine}
          open={!!editingJobLine}
          onOpenChange={() => setEditingJobLine(null)}
          onSave={handleEditSave}
        />
      )}

      {/* Add Parts Dialog */}
      {addingPartsJobLineId && (
        <AddPartsDialog
          workOrderId={jobLines.find(jl => jl.id === addingPartsJobLineId)?.workOrderId || ''}
          jobLineId={addingPartsJobLineId}
          onPartsAdd={handlePartsAdded}
          open={!!addingPartsJobLineId}
          onOpenChange={() => setAddingPartsJobLineId(null)}
        />
      )}
    </>
  );
}
