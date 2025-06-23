
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { WorkOrderPart, partStatusMap, WorkOrderPartFormValues } from '@/types/workOrderPart';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { AddPartDialog } from './AddPartDialog';
import { EditPartDialog } from './EditPartDialog';

interface ComprehensivePartsTableProps {
  workOrderId: string;
  parts: WorkOrderPart[];
  onPartsChange: () => void;
  isEditMode?: boolean;
}

export function ComprehensivePartsTable({
  workOrderId,
  parts,
  onPartsChange,
  isEditMode = false
}: ComprehensivePartsTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingPart, setEditingPart] = useState<WorkOrderPart | null>(null);

  const filteredParts = parts.filter(part =>
    part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    part.part_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (part.description && part.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalValue = filteredParts.reduce((sum, part) => sum + part.total_price, 0);

  const handleAddPart = async (formData: WorkOrderPartFormValues) => {
    // The AddPartDialog will handle the actual addition
    onPartsChange();
    setShowAddDialog(false);
  };

  const handleEditPart = async (formData: WorkOrderPartFormValues) => {
    // The EditPartDialog will handle the actual update
    onPartsChange();
    setEditingPart(null);
  };

  const handleDeletePart = async (partId: string) => {
    // Implementation would go here
    console.log('Delete part:', partId);
    onPartsChange();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            Parts Overview
            <Badge variant="secondary">{filteredParts.length} items</Badge>
          </CardTitle>
          {isEditMode && (
            <Button onClick={() => setShowAddDialog(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Part
            </Button>
          )}
        </div>
        
        <div className="flex items-center gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search parts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="text-sm text-muted-foreground">
            Total Value: <span className="font-semibold">${totalValue.toFixed(2)}</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {filteredParts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Plus className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No parts found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm ? 'No parts match your search.' : 'No parts have been added to this work order yet.'}
            </p>
            {isEditMode && !searchTerm && (
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Part
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Part Details</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  {isEditMode && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredParts.map((part) => (
                  <TableRow key={part.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{part.name}</div>
                        <div className="text-sm text-gray-500">{part.part_number}</div>
                        {part.description && (
                          <div className="text-sm text-gray-400 mt-1">
                            {part.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {part.part_type || 'Standard'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        className={partStatusMap[part.status || 'pending']?.classes || 'bg-gray-100 text-gray-800'}
                      >
                        {partStatusMap[part.status || 'pending']?.label || part.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {part.quantity}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ${(part.unit_price || 0).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ${part.total_price.toFixed(2)}
                    </TableCell>
                    {isEditMode && (
                      <TableCell className="text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingPart(part)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeletePart(part.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      <AddPartDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        workOrderId={workOrderId}
        onPartAdded={handleAddPart}
      />

      {editingPart && (
        <EditPartDialog
          open={!!editingPart}
          onOpenChange={() => setEditingPart(null)}
          part={editingPart}
          onPartUpdated={handleEditPart}
        />
      )}
    </Card>
  );
}
