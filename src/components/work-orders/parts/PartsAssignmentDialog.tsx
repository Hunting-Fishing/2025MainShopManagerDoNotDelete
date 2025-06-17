
import React, { useState } from 'react';
import { WorkOrderPart } from '@/types/workOrderPart';
import { WorkOrderJobLine } from '@/types/jobLine';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { updateWorkOrderPart } from '@/services/workOrder/workOrderPartsService';
import { toast } from '@/hooks/use-toast';
import { Package, ArrowRight } from 'lucide-react';

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
  const [isAssigning, setIsAssigning] = useState(false);

  const handleAssign = async () => {
    if (!selectedJobLineId) {
      toast({
        title: "Error",
        description: "Please select a job line",
        variant: "destructive"
      });
      return;
    }

    setIsAssigning(true);
    const assignedParts: WorkOrderPart[] = [];

    try {
      for (const part of parts) {
        const updatedPart = { ...part, job_line_id: selectedJobLineId };
        await updateWorkOrderPart(part.id, updatedPart);
        assignedParts.push(updatedPart);
      }

      const jobLine = jobLines.find(jl => jl.id === selectedJobLineId);
      toast({
        title: "Parts Assigned",
        description: `${parts.length} part(s) assigned to ${jobLine?.name}`,
      });

      onPartsAssigned(assignedParts);
      onClose();
    } catch (error) {
      console.error('Error assigning parts:', error);
      toast({
        title: "Error",
        description: "Failed to assign parts",
        variant: "destructive"
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const selectedJobLine = jobLines.find(jl => jl.id === selectedJobLineId);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Assign Parts to Job Line
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Parts to Assign */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Parts to assign ({parts.length}):
            </label>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {parts.map((part) => (
                <div key={part.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm font-medium">{part.name}</span>
                  <Badge variant="outline" className="text-xs">
                    Qty: {part.quantity}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Job Line Selection */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Assign to job line:
            </label>
            <Select value={selectedJobLineId} onValueChange={setSelectedJobLineId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a job line..." />
              </SelectTrigger>
              <SelectContent>
                {jobLines.map((jobLine) => (
                  <SelectItem key={jobLine.id} value={jobLine.id}>
                    <div className="flex items-center gap-2">
                      <ArrowRight className="h-3 w-3" />
                      {jobLine.name}
                      {jobLine.category && (
                        <Badge variant="secondary" className="text-xs">
                          {jobLine.category}
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Assignment Preview */}
          {selectedJobLine && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-sm font-medium text-blue-900 mb-1">
                Assignment Preview:
              </div>
              <div className="text-sm text-blue-700">
                {parts.length} part(s) will be assigned to "{selectedJobLine.name}"
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isAssigning}>
            Cancel
          </Button>
          <Button onClick={handleAssign} disabled={!selectedJobLineId || isAssigning}>
            {isAssigning ? 'Assigning...' : 'Assign Parts'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
