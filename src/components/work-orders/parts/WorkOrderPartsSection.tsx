
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, GripVertical, Edit, Trash2, Package } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AddPartDialog } from './AddPartDialog';
import { EditPartDialog } from './EditPartDialog';
import { Badge } from '@/components/ui/badge';
import { partStatusMap } from '@/types/workOrderPart';
import { WorkOrderPart } from '@/types/workOrderPart';
import { WorkOrderJobLine } from '@/types/jobLine';
import { UnassignedPartsSection } from './UnassignedPartsSection';

interface WorkOrderPartsSectionProps {
  workOrderId: string;
  parts: WorkOrderPart[];
  jobLines: WorkOrderJobLine[];
  onPartsChange: () => Promise<void>;
  isEditMode: boolean;
  showType?: 'overview' | 'parts';
}

export function WorkOrderPartsSection({
  workOrderId,
  parts,
  jobLines,
  onPartsChange,
  isEditMode,
  showType = 'parts'
}: WorkOrderPartsSectionProps) {
  const [showAddPartDialog, setShowAddPartDialog] = useState(false);
  const [selectedPart, setSelectedPart] = useState<WorkOrderPart | null>(null);
  const [showEditPartDialog, setShowEditPartDialog] = useState(false);

  const handleEditPart = (part: WorkOrderPart) => {
    setSelectedPart(part);
    setShowEditPartDialog(true);
  };

  const handleDeletePart = async (partId: string) => {
    // Simple confirmation dialog
    if (confirm('Are you sure you want to delete this part?')) {
      // Here you would implement the actual delete logic
      console.log('Deleting part:', partId);
      await onPartsChange();
    }
  };

  // Separate assigned and unassigned parts
  const assignedParts = parts.filter(part => part.job_line_id);
  const unassignedParts = parts.filter(part => !part.job_line_id);

  if (parts.length === 0) {
    return (
      <>
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="h-4 w-4" />
                Parts
              </CardTitle>
              {isEditMode && (
                <Button size="sm" className="h-8 px-3" onClick={() => setShowAddPartDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Part
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No parts added</p>
              <p className="text-sm">Add parts to this work order</p>
            </div>
          </CardContent>
        </Card>

        <AddPartDialog
          isOpen={showAddPartDialog}
          onClose={() => setShowAddPartDialog(false)}
          workOrderId={workOrderId}
          onPartAdded={onPartsChange}
        />
      </>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Unassigned Parts Section */}
        {unassignedParts.length > 0 && (
          <UnassignedPartsSection
            workOrderId={workOrderId}
            unassignedParts={unassignedParts}
            jobLines={jobLines}
            onPartAssigned={onPartsChange}
            isEditMode={isEditMode}
          />
        )}

        {/* Assigned Parts by Job Line */}
        {jobLines.map(jobLine => {
          const jobLineParts = assignedParts.filter(part => part.job_line_id === jobLine.id);
          
          if (jobLineParts.length === 0 && showType === 'overview') {
            return null; // Don't show empty job lines in overview
          }

          return (
            <Card key={jobLine.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    {jobLine.name} - Parts ({jobLineParts.length})
                  </CardTitle>
                  {isEditMode && (
                    <Button size="sm" className="h-8 px-3" onClick={() => setShowAddPartDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Part
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {jobLineParts.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    <p className="text-sm">No parts assigned to this job line</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[300px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Part #</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Qty</TableHead>
                          <TableHead>Unit Price</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Status</TableHead>
                          {isEditMode && <TableHead>Actions</TableHead>}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {jobLineParts.map((part) => (
                          <TableRow key={part.id}>
                            <TableCell>{part.part_number}</TableCell>
                            <TableCell>{part.name}</TableCell>
                            <TableCell>{part.quantity}</TableCell>
                            <TableCell>${part.unit_price}</TableCell>
                            <TableCell>${part.total_price}</TableCell>
                            <TableCell>
                              <Badge className={partStatusMap[part.status || 'pending']?.classes}>
                                {partStatusMap[part.status || 'pending']?.label}
                              </Badge>
                            </TableCell>
                            {isEditMode && (
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                      <GripVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuItem onClick={() => handleEditPart(part)}>
                                      <Edit className="mr-2 h-4 w-4" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem 
                                      onClick={() => handleDeletePart(part.id)}
                                      className="text-red-600"
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            )}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          );
        })}

        {/* General Parts Section (when no job lines exist) */}
        {jobLines.length === 0 && assignedParts.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Parts ({assignedParts.length})
                </CardTitle>
                {isEditMode && (
                  <Button size="sm" className="h-8 px-3" onClick={() => setShowAddPartDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Part
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <ScrollArea className="h-[300px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Part #</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      {isEditMode && <TableHead>Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assignedParts.map((part) => (
                      <TableRow key={part.id}>
                        <TableCell>{part.part_number}</TableCell>
                        <TableCell>{part.name}</TableCell>
                        <TableCell>{part.quantity}</TableCell>
                        <TableCell>${part.unit_price}</TableCell>
                        <TableCell>${part.total_price}</TableCell>
                        <TableCell>
                          <Badge className={partStatusMap[part.status || 'pending']?.classes}>
                            {partStatusMap[part.status || 'pending']?.label}
                          </Badge>
                        </TableCell>
                        {isEditMode && (
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <GripVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => handleEditPart(part)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => handleDeletePart(part.id)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dialogs */}
      <AddPartDialog
        isOpen={showAddPartDialog}
        onClose={() => setShowAddPartDialog(false)}
        workOrderId={workOrderId}
        onPartAdded={onPartsChange}
      />

      {selectedPart && (
        <EditPartDialog
          open={showEditPartDialog}
          onClose={() => setShowEditPartDialog(false)}
          part={selectedPart}
          jobLines={jobLines}
          onPartUpdated={onPartsChange}
        />
      )}
    </>
  );
}
