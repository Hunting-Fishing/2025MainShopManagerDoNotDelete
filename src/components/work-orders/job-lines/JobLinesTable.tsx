
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Edit, Package } from 'lucide-react';
import { WorkOrderJobLine } from '@/types/jobLine';
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
  onPartsUpdated?: () => void;
}

export function JobLinesTable({ 
  jobLines, 
  isEditMode = false,
  onUpdate = () => {},
  onDelete = () => {},
  onAddParts,
  onRemovePart,
  onPartsUpdated
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
    console.log('Parts added, refreshing job lines...');
    if (onPartsUpdated) {
      onPartsUpdated();
    }
  };

  if (jobLines.length === 0) {
    return (
      <Card className="border-dashed border-2">
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Package className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground mb-2">No Job Lines Found</h3>
          <p className="text-sm text-muted-foreground text-center">
            Job lines will be automatically parsed from the work order description.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Service Details ({jobLines.length} service{jobLines.length !== 1 ? 's' : ''})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Hours</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead>Labor</TableHead>
                <TableHead>Parts</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                {isEditMode && <TableHead>Actions</TableHead>}
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
                            <div className="text-sm text-muted-foreground">
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
                      <TableCell>{jobLine.estimatedHours?.toFixed(1) || '0.0'}</TableCell>
                      <TableCell>${jobLine.laborRate?.toFixed(2) || '0.00'}</TableCell>
                      <TableCell>${jobLine.totalAmount?.toFixed(2) || '0.00'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">
                            {jobLine.parts?.length || 0} part{(jobLine.parts?.length || 0) !== 1 ? 's' : ''}
                          </span>
                          {partsTotal > 0 && (
                            <span className="text-sm font-medium text-green-600">
                              ${partsTotal.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-green-600">
                          ${totalWithParts.toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusInfo.classes}>
                          {statusInfo.label}
                        </Badge>
                      </TableCell>
                      {isEditMode && (
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <AddPartsDialog
                              workOrderId={jobLine.workOrderId || ''}
                              jobLineId={jobLine.id}
                              onPartsAdd={handlePartsAdded}
                            />
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
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                    {/* Parts Display Row */}
                    {jobLine.parts && jobLine.parts.length > 0 && (
                      <TableRow>
                        <TableCell colSpan={isEditMode ? 9 : 8} className="p-0">
                          <div className="p-4 bg-muted/30">
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
        </CardContent>
      </Card>

      {editingJobLine && (
        <EditJobLineDialog
          jobLine={editingJobLine}
          open={!!editingJobLine}
          onOpenChange={() => setEditingJobLine(null)}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
}
