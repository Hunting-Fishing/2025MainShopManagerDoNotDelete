import React, { useState } from 'react';
import { WorkOrderPart } from '@/types/workOrderPart';
import { WorkOrderJobLine } from '@/types/jobLine';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, GripVertical, Edit, Trash2, Package } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AddPartDialog } from './AddPartDialog';
import { EditPartDialog } from './EditPartDialog';
import { DeletePartDialog } from './DeletePartDialog';
import { Badge } from '@/components/ui/badge';
import { partStatusMap } from '@/types/workOrderPart';

interface WorkOrderPartsSectionProps {
  workOrderId: string;
  jobLines: WorkOrderJobLine[];
  parts: WorkOrderPart[];
  onPartAdd?: (newPart: WorkOrderPart) => Promise<void>;
  onPartUpdate?: (updatedPart: WorkOrderPart) => Promise<void>;
  onPartDelete?: (partId: string) => Promise<void>;
  isEditMode: boolean;
}

export function WorkOrderPartsSection({
  workOrderId,
  jobLines,
  parts,
  onPartAdd,
  onPartUpdate,
  onPartDelete,
  isEditMode
}: WorkOrderPartsSectionProps) {
  const [showAddPartDialog, setShowAddPartDialog] = useState(false);
  const [selectedPart, setSelectedPart] = useState<WorkOrderPart | null>(null);
	const [showEditPartDialog, setShowEditPartDialog] = useState(false);
  const [showDeletePartDialog, setShowDeletePartDialog] = useState(false);

  const handleEditPart = (part: WorkOrderPart) => {
		setSelectedPart(part);
		setShowEditPartDialog(true);
	};

	const handleDeletePart = (part: WorkOrderPart) => {
		setSelectedPart(part);
		setShowDeletePartDialog(true);
	};

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
          onPartAdded={() => {}}
        />
      </>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="h-4 w-4" />
              Parts ({parts.length})
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
          <ScrollArea>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead>Part #</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead className="text-right">Total Price</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {parts.map((part) => (
                  <TableRow key={part.id}>
                    <TableCell>
                      {part.status && part.status in partStatusMap ? (
                        <Badge className={partStatusMap[part.status].classes}>
                          {partStatusMap[part.status].label}
                        </Badge>
                      ) : (
                        <Badge>Unknown</Badge>
                      )}
                    </TableCell>
                    <TableCell>{part.part_number}</TableCell>
                    <TableCell>{part.name}</TableCell>
                    <TableCell>{part.quantity}</TableCell>
                    <TableCell>${part.unit_price}</TableCell>
                    <TableCell className="text-right">${part.total_price}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <GripVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleEditPart(part)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeletePart(part)}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      <AddPartDialog
        isOpen={showAddPartDialog}
        onClose={() => setShowAddPartDialog(false)}
        workOrderId={workOrderId}
        onPartAdded={() => {}}
      />

      <EditPartDialog
				isOpen={showEditPartDialog}
				onClose={() => setShowEditPartDialog(false)}
				part={selectedPart}
				onPartUpdate={onPartUpdate}
			/>

      <DeletePartDialog
				isOpen={showDeletePartDialog}
				onClose={() => setShowDeletePartDialog(false)}
				partId={selectedPart?.id || ''}
				onPartDelete={onPartDelete}
			/>
    </>
  );
}
