import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Wrench, Settings, FileText, Package } from 'lucide-react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { AddPartForm } from '../parts/AddPartForm';
import { ServiceBasedJobLineForm } from './ServiceBasedJobLineForm';
import { WorkOrderPartFormValues } from '@/types/workOrderPart';

interface DetailFormButtonProps {
  jobLine: WorkOrderJobLine;
  onUpdate: (updatedJobLine: WorkOrderJobLine) => void;
  onAddPart?: (partData: WorkOrderPartFormValues) => Promise<void>;
}

export function DetailFormButton({ jobLine, onUpdate, onAddPart }: DetailFormButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getIconForCategory = (category?: string) => {
    switch (category?.toLowerCase()) {
      case 'labor':
        return <Wrench className="h-4 w-4" />;
      case 'parts':
        return <Package className="h-4 w-4" />;
      case 'sublet':
        return <Settings className="h-4 w-4" />;
      case 'note':
        return <FileText className="h-4 w-4" />;
      default:
        return <Plus className="h-4 w-4" />;
    }
  };

  const getFormTitle = (category?: string) => {
    switch (category?.toLowerCase()) {
      case 'labor':
        return 'Labor Details';
      case 'parts':
        return 'Parts Details';
      case 'sublet':
        return 'Subcontractor Details';
      case 'note':
        return 'Note Details';
      default:
        return 'Item Details';
    }
  };

  const isDisabled = jobLine.category?.toLowerCase() === 'note';

  const handleFormSubmit = async (data: any) => {
    if (jobLine.category?.toLowerCase() === 'parts' && onAddPart) {
      // For parts, add a new part to the job line
      await onAddPart(data);
    } else {
      // For labor and other types, update the job line itself
      const updatedJobLine: WorkOrderJobLine = {
        ...jobLine,
        ...data,
        updated_at: new Date().toISOString()
      };
      onUpdate(updatedJobLine);
    }
    setIsOpen(false);
  };

  const handleServiceSave = (jobLines: WorkOrderJobLine[]) => {
    // For service selection, we typically get an array but we're editing a single line
    if (jobLines.length > 0) {
      const updatedJobLine = {
        ...jobLine,
        ...jobLines[0],
        id: jobLine.id, // Keep the original ID
        work_order_id: jobLine.work_order_id, // Keep the original work order ID
        updated_at: new Date().toISOString()
      };
      onUpdate(updatedJobLine);
    }
    setIsOpen(false);
  };

  const renderForm = () => {
    switch (jobLine.category?.toLowerCase()) {
      case 'labor':
        return (
          <ServiceBasedJobLineForm
            workOrderId={jobLine.work_order_id}
            jobLine={jobLine}
            mode="service"
            onSave={handleServiceSave}
            onCancel={() => setIsOpen(false)}
          />
        );
      case 'parts':
        return (
          <AddPartForm
            onSubmit={handleFormSubmit}
            onCancel={() => setIsOpen(false)}
          />
        );
      default:
        return (
          <div className="p-4 text-center text-muted-foreground">
            <p>No detailed form available for this item type.</p>
            <Button onClick={() => setIsOpen(false)} className="mt-4">
              Close
            </Button>
          </div>
        );
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="h-8 w-8 p-0 hover:bg-primary/10"
        title={`Open ${getFormTitle(jobLine.category)} for ${jobLine.name}`}
      >
        <Plus className="h-4 w-4 text-primary" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {getIconForCategory(jobLine.category)}
              {getFormTitle(jobLine.category)} - {jobLine.name}
            </DialogTitle>
          </DialogHeader>
          {renderForm()}
        </DialogContent>
      </Dialog>
    </>
  );
}