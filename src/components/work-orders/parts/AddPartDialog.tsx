
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ComprehensivePartEntryForm } from './ComprehensivePartEntryForm';
import { useParams } from 'react-router-dom';
import { WorkOrderJobLine } from '@/types/jobLine';

interface AddPartDialogProps {
  workOrderId: string;
  jobLines?: WorkOrderJobLine[];
  jobLineId?: string;
  onPartAdd?: (part: any) => void;
  isOpen?: boolean;
  onClose?: () => void;
  onPartAdded?: () => void;
}

export function AddPartDialog({
  workOrderId,
  jobLines,
  jobLineId,
  onPartAdd,
  isOpen: externalIsOpen,
  onClose: externalOnClose,
  onPartAdded
}: AddPartDialogProps) {
  const params = useParams();
  const [internalIsOpen, setInternalIsOpen] = useState(false);

  // Use workOrderId from props or URL params
  const currentWorkOrderId = workOrderId || params.id;

  // Use external state if provided, otherwise use internal state
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = externalOnClose ? (open: boolean) => {
    if (!open) externalOnClose();
  } : setInternalIsOpen;

  const handlePartAdd = (part: any) => {
    console.log('Part added successfully:', part);
    
    // Call callbacks
    if (onPartAdd) {
      onPartAdd(part);
    }
    if (onPartAdded) {
      onPartAdded();
    }
    
    // Close dialog
    setIsOpen(false);
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {externalIsOpen === undefined && (
        <DialogTrigger asChild>
          <Button variant="outline">Add Part</Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Part</DialogTitle>
        </DialogHeader>
        
        <ComprehensivePartEntryForm 
          workOrderId={currentWorkOrderId}
          jobLineId={jobLineId}
          jobLines={jobLines}
          onPartAdd={handlePartAdd} 
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
}
