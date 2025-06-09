
import React, { useState } from 'react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Trash2, Eye } from 'lucide-react';
import { jobLineStatusMap } from '@/types/jobLine';
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

  const handleEdit = (jobLine: WorkOrderJobLine) => {
    setEditingJobLine(jobLine);
  };

  const handleSaveEdit = (updatedJobLine: WorkOrderJobLine) => {
    onUpdate(updatedJobLine);
    setEditingJobLine(null);
  };

  const handlePartsAdded = () => {
    // Callback to refresh the job lines display after parts are added
    console.log('Parts added - refreshing job lines display');
  };

  return (
    <>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Hours</TableHead>
              <TableHead>Rate</TableHead>
              <TableHead>Labor Cost</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Actions</TableHead>
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
                        {jobLine.category && (
                          <Badge variant="outline" className="text-xs mt-1">
                            {jobLine.category}
                          </Badge>
                        )}
                        {jobLine.description && (
                          <div className="text-sm text-muted-foreground mt-1">
                            {jobLine.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusInfo.classes}>
                        {statusInfo.label}
                      </Badge>
                    </TableCell>
                    <TableCell>{jobLine.estimatedHours?.toFixed(1) || '0.0'}</TableCell>
                    <TableCell>${jobLine.laborRate?.toFixed(2) || '0.00'}</TableCell>
                    <TableCell>${jobLine.totalAmount?.toFixed(2) || '0.00'}</TableCell>
                    <TableCell>
                      <span className="font-medium text-green-600">
                        ${totalWithParts.toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {isEditMode && (
                          <AddPartsDialog
                            workOrderId={jobLine.workOrderId || ''}
                            jobLineId={jobLine.id}
                            onPartsAdd={handlePartsAdded}
                          />
                        )}
                        {isEditMode && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(jobLine)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onDelete(jobLine.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                  {/* Parts Row - Show parts attached to this job line */}
                  {jobLine.parts && jobLine.parts.length > 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="bg-muted/30 p-0">
                        <div className="p-4">
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

      {editingJobLine && (
        <EditJobLineDialog
          jobLine={editingJobLine}
          open={!!editingJobLine}
          onOpenChange={() => setEditingJobLine(null)}
          onSave={handleSaveEdit}
        />
      )}
    </>
  );
}
