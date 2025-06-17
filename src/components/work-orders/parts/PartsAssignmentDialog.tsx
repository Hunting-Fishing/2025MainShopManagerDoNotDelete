
import React, { useState } from 'react';
import { WorkOrderPart } from '@/types/workOrderPart';
import { WorkOrderJobLine } from '@/types/jobLine';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { assignPartToJobLine, bulkAssignParts } from '@/services/workOrder/partsAssignmentService';
import { toast } from '@/hooks/use-toast';
import { ArrowRight, Users } from 'lucide-react';

interface PartsAssignmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  parts: WorkOrderPart[];
  jobLines: WorkOrderJobLine[];
  onPartsAssigned: (assignedParts: WorkOrderPart[]) => void;
}

export function PartsAssignmentDialog({
  isOpen,
  onClose,
  parts,
  jobLines,
  onPartsAssigned
}: PartsAssignmentDialogProps) {
  const [selectedJobLineId, setSelectedJobLineId] = useState<string>('');
  const [selectedPartIds, setSelectedPartIds] = useState<string[]>([]);
  const [isAssigning, setIsAssigning] = useState(false);

  const handlePartSelection = (partId: string, checked: boolean) => {
    if (checked) {
      setSelectedPartIds([...selectedPartIds, partId]);
    } else {
      setSelectedPartIds(selectedPartIds.filter(id => id !== partId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPartIds(parts.map(part => part.id));
    } else {
      setSelectedPartIds([]);
    }
  };

  const handleAssign = async () => {
    if (!selectedJobLineId || selectedPartIds.length === 0) {
      toast({
        title: "Selection Required",
        description: "Please select a job line and at least one part",
        variant: "destructive"
      });
      return;
    }

    setIsAssigning(true);
    try {
      let assignedParts: WorkOrderPart[];
      
      if (selectedPartIds.length === 1) {
        const assignedPart = await assignPartToJobLine(selectedPartIds[0], selectedJobLineId);
        assignedParts = [assignedPart];
      } else {
        assignedParts = await bulkAssignParts(selectedPartIds, selectedJobLineId);
      }

      const jobLine = jobLines.find(jl => jl.id === selectedJobLineId);
      toast({
        title: "Parts Assigned",
        description: `${selectedPartIds.length} part(s) assigned to ${jobLine?.name || 'job line'}`,
      });

      onPartsAssigned(assignedParts);
      onClose();
    } catch (error) {
      console.error('Error assigning parts:', error);
      toast({
        title: "Assignment Failed",
        description: "Failed to assign parts. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Assign Parts to Job Line
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Job Line Selection */}
          <div>
            <label className="text-sm font-medium mb-2 block">Select Job Line</label>
            <Select value={selectedJobLineId} onValueChange={setSelectedJobLineId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a job line..." />
              </SelectTrigger>
              <SelectContent>
                {jobLines.map((jobLine) => (
                  <SelectItem key={jobLine.id} value={jobLine.id}>
                    <div className="flex items-center gap-2">
                      <ArrowRight className="h-3 w-3" />
                      {jobLine.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Parts Selection */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium">Select Parts ({selectedPartIds.length} selected)</label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="select-all"
                  checked={selectedPartIds.length === parts.length}
                  onCheckedChange={handleSelectAll}
                />
                <label htmlFor="select-all" className="text-sm">Select All</label>
              </div>
            </div>

            <div className="border rounded-lg max-h-64 overflow-y-auto">
              {parts.map((part) => (
                <div key={part.id} className="flex items-center space-x-3 p-3 border-b last:border-b-0 hover:bg-gray-50">
                  <Checkbox
                    checked={selectedPartIds.includes(part.id)}
                    onCheckedChange={(checked) => handlePartSelection(part.id, checked as boolean)}
                  />
                  <div className="flex-1">
                    <div className="font-medium">{part.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Part #: {part.part_number} | Qty: {part.quantity} | ${part.unit_price}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleAssign}
              disabled={!selectedJobLineId || selectedPartIds.length === 0 || isAssigning}
            >
              {isAssigning ? 'Assigning...' : `Assign ${selectedPartIds.length} Part(s)`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
