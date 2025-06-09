
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, Edit, Clock, DollarSign } from 'lucide-react';
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
}

export function JobLinesTable({ 
  jobLines, 
  isEditMode = false, 
  onUpdate = () => {},
  onDelete = () => {},
  onAddParts,
  onRemovePart
}: JobLinesTableProps) {
  const [editDialogOpen, setEditDialogOpen] = useState<string | null>(null);

  const handleEditClick = (jobLineId: string) => {
    setEditDialogOpen(jobLineId);
  };

  const handleSaveEdit = (updatedJobLine: WorkOrderJobLine) => {
    onUpdate(updatedJobLine);
    setEditDialogOpen(null);
  };

  const handlePartsAdded = () => {
    // Simple callback to refresh parts display
    console.log('Parts added, refreshing display');
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Service</TableHead>
              <TableHead className="w-[100px]">Status</TableHead>
              <TableHead className="w-[80px]">Hours</TableHead>
              <TableHead className="w-[100px]">Rate</TableHead>
              <TableHead className="w-[100px]">Labor Cost</TableHead>
              <TableHead className="w-[100px]">Total</TableHead>
              {isEditMode && <TableHead className="w-[150px]">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobLines.map((jobLine) => {
              const statusInfo = jobLineStatusMap[jobLine.status] || jobLineStatusMap.pending;
              
              // Calculate total including parts
              const partsTotal = jobLine.parts?.reduce((total, part) => 
                total + (part.customerPrice * part.quantity), 0) || 0;
              const totalWithParts = (jobLine.totalAmount || 0) + partsTotal;

              return (
                <TableRow key={jobLine.id}>
                  <TableCell>
                    <div className="space-y-2">
                      <div className="space-y-1">
                        <div className="font-medium">{jobLine.name}</div>
                        {jobLine.description && (
                          <div className="text-sm text-muted-foreground">
                            {jobLine.description}
                          </div>
                        )}
                        {jobLine.category && (
                          <Badge variant="outline" className="text-xs">
                            {jobLine.category}
                          </Badge>
                        )}
                      </div>
                      
                      {/* Parts Display */}
                      <JobLinePartsDisplay 
                        parts={jobLine.parts || []}
                        onRemovePart={onRemovePart}
                        isEditMode={isEditMode}
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusInfo.classes}>
                      {statusInfo.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">
                        {jobLine.estimatedHours?.toFixed(1) || '0.0'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">
                        {jobLine.laborRate?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">
                        {jobLine.totalAmount?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3 text-green-600" />
                      <span className="text-sm font-medium text-green-600">
                        {totalWithParts.toFixed(2)}
                      </span>
                    </div>
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
                          onClick={() => handleEditClick(jobLine.id)}
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
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      {editDialogOpen && (
        <EditJobLineDialog
          jobLine={jobLines.find(jl => jl.id === editDialogOpen)!}
          open={!!editDialogOpen}
          onOpenChange={() => setEditDialogOpen(null)}
          onSave={handleSaveEdit}
        />
      )}
    </>
  );
}
