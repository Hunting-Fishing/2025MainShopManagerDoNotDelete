
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WorkOrderJobLine, JobLineStatus, LaborRateType, isValidJobLineStatus, isValidLaborRateType } from '@/types/jobLine';
import { SelectedService } from '@/types/selectedService';
import { ServicesSection } from '@/components/work-orders/fields/ServicesSection';
import { createWorkOrderJobLine, updateWorkOrderJobLine } from '@/services/workOrder/jobLinesService';
import { toast } from 'sonner';

interface UnifiedJobLineFormDialogProps {
  workOrderId: string;
  jobLine?: WorkOrderJobLine | null; // For edit mode
  mode: 'add-service' | 'add-manual' | 'edit';
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (jobLines: WorkOrderJobLine[]) => void;
}

export function UnifiedJobLineFormDialog({
  workOrderId,
  jobLine = null,
  mode,
  open,
  onOpenChange,
  onSave
}: UnifiedJobLineFormDialogProps) {
  const [activeTab, setActiveTab] = useState<'service' | 'manual'>(
    mode === 'add-service' ? 'service' : 'manual'
  );
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Manual form data
  const [manualFormData, setManualFormData] = useState({
    name: '',
    description: '',
    estimated_hours: 0,
    labor_rate: 0,
    labor_rate_type: 'standard' as LaborRateType,
    status: 'pending' as JobLineStatus,
    notes: ''
  });

  // Initialize form data for edit mode
  useEffect(() => {
    if (mode === 'edit' && jobLine) {
      setManualFormData({
        name: jobLine.name || '',
        description: jobLine.description || '',
        estimated_hours: jobLine.estimated_hours || 0,
        labor_rate: jobLine.labor_rate || 0,
        labor_rate_type: isValidLaborRateType(jobLine.labor_rate_type || 'standard') ? jobLine.labor_rate_type! : 'standard',
        status: isValidJobLineStatus(jobLine.status || 'pending') ? jobLine.status! : 'pending',
        notes: jobLine.notes || ''
      });
    }
  }, [mode, jobLine]);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setSelectedServices([]);
      setManualFormData({
        name: '',
        description: '',
        estimated_hours: 0,
        labor_rate: 0,
        labor_rate_type: 'standard',
        status: 'pending',
        notes: ''
      });
    }
  }, [open]);

  const calculateTotal = (hours: number, rate: number) => hours * rate;

  const handleServiceSubmit = async () => {
    if (selectedServices.length === 0) {
      toast.error('Please select at least one service');
      return;
    }

    setIsLoading(true);
    try {
      const createdJobLines: WorkOrderJobLine[] = [];
      
      for (const [index, service] of selectedServices.entries()) {
        const jobLineData = {
          work_order_id: workOrderId,
          name: service.name,
          category: service.category,
          subcategory: service.subcategory,
          description: service.description,
          estimated_hours: service.estimated_hours,
          labor_rate: service.labor_rate,
          labor_rate_type: 'standard' as LaborRateType,
          total_amount: service.total_amount,
          status: 'pending' as JobLineStatus,
          display_order: index,
          notes: ''
        };

        const createdJobLine = await createWorkOrderJobLine(jobLineData);
        createdJobLines.push(createdJobLine);
      }

      toast.success(`Added ${createdJobLines.length} job line${createdJobLines.length !== 1 ? 's' : ''} successfully`);
      onSave(createdJobLines);
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating job lines from services:', error);
      toast.error('Failed to add job lines');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualSubmit = async () => {
    if (!manualFormData.name.trim()) {
      toast.error('Job line name is required');
      return;
    }

    setIsLoading(true);
    try {
      if (mode === 'edit' && jobLine) {
        // Update existing job line
        const updatedJobLine = await updateWorkOrderJobLine(jobLine.id, {
          ...manualFormData,
          total_amount: calculateTotal(manualFormData.estimated_hours, manualFormData.labor_rate)
        });
        toast.success('Job line updated successfully');
        onSave([updatedJobLine]);
      } else {
        // Create new job line
        const jobLineData = {
          work_order_id: workOrderId,
          ...manualFormData,
          total_amount: calculateTotal(manualFormData.estimated_hours, manualFormData.labor_rate),
          display_order: 0
        };

        const createdJobLine = await createWorkOrderJobLine(jobLineData);
        toast.success('Job line added successfully');
        onSave([createdJobLine]);
      }
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving job line:', error);
      toast.error('Failed to save job line');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateServices = (services: SelectedService[]) => {
    setSelectedServices(services);
  };

  const getDialogTitle = () => {
    switch (mode) {
      case 'add-service':
        return 'Add Job Lines from Services';
      case 'add-manual':
        return 'Add Manual Job Line';
      case 'edit':
        return 'Edit Job Line';
      default:
        return 'Manage Job Line';
    }
  };

  const renderServiceTab = () => (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h3 className="text-lg font-semibold">Select Services</h3>
        <p className="text-sm text-muted-foreground">
          Choose from our service catalog to add job lines to this work order
        </p>
      </div>

      <div className="max-h-96 overflow-y-auto">
        <ServicesSection
          selectedServices={selectedServices}
          onUpdateServices={handleUpdateServices}
        />
      </div>

      {selectedServices.length > 0 && (
        <div className="border-t pt-4">
          <h4 className="font-medium mb-2">Selected Services ({selectedServices.length})</h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {selectedServices.map((service) => (
              <div key={service.id} className="flex justify-between items-center text-sm p-2 bg-muted rounded">
                <div>
                  <span className="font-medium">{service.name}</span>
                  <span className="text-muted-foreground ml-2">
                    {service.category} › {service.subcategory}
                  </span>
                </div>
                <span className="font-medium">${service.total_amount}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
          Cancel
        </Button>
        <Button 
          onClick={handleServiceSubmit}
          disabled={selectedServices.length === 0 || isLoading}
        >
          {isLoading ? 'Adding...' : `Add ${selectedServices.length} Job Line${selectedServices.length !== 1 ? 's' : ''}`}
        </Button>
      </div>
    </div>
  );

  const renderManualTab = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="name">Job Line Name</Label>
        <Input
          id="name"
          value={manualFormData.name}
          onChange={(e) => setManualFormData({ ...manualFormData, name: e.target.value })}
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={manualFormData.description}
          onChange={(e) => setManualFormData({ ...manualFormData, description: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="hours">Estimated Hours</Label>
          <Input
            id="hours"
            type="number"
            step="0.25"
            value={manualFormData.estimated_hours}
            onChange={(e) => setManualFormData({ ...manualFormData, estimated_hours: parseFloat(e.target.value) || 0 })}
          />
        </div>
        <div>
          <Label htmlFor="rate">Labor Rate ($)</Label>
          <Input
            id="rate"
            type="number"
            step="0.01"
            value={manualFormData.labor_rate}
            onChange={(e) => setManualFormData({ ...manualFormData, labor_rate: parseFloat(e.target.value) || 0 })}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="total">Total Amount ($)</Label>
        <Input
          id="total"
          type="number"
          step="0.01"
          value={calculateTotal(manualFormData.estimated_hours, manualFormData.labor_rate)}
          readOnly
          className="bg-muted"
        />
      </div>

      <div>
        <Label htmlFor="rate-type">Rate Type</Label>
        <Select
          value={manualFormData.labor_rate_type}
          onValueChange={(value) => {
            if (isValidLaborRateType(value)) {
              setManualFormData({ ...manualFormData, labor_rate_type: value });
            }
          }}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="standard">Standard</SelectItem>
            <SelectItem value="overtime">Overtime</SelectItem>
            <SelectItem value="premium">Premium</SelectItem>
            <SelectItem value="flat_rate">Flat Rate</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="status">Status</Label>
        <Select
          value={manualFormData.status}
          onValueChange={(value) => {
            if (isValidJobLineStatus(value)) {
              setManualFormData({ ...manualFormData, status: value });
            }
          }}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="on-hold">On Hold</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={manualFormData.notes}
          onChange={(e) => setManualFormData({ ...manualFormData, notes: e.target.value })}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
          Cancel
        </Button>
        <Button onClick={handleManualSubmit} disabled={isLoading}>
          {isLoading ? 'Saving...' : mode === 'edit' ? 'Update Job Line' : 'Add Job Line'}
        </Button>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>{getDialogTitle()}</DialogTitle>
        </DialogHeader>
        
        {mode === 'edit' ? (
          <div className="flex-1 overflow-auto">
            {renderManualTab()}
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'service' | 'manual')} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-2 flex-shrink-0">
              <TabsTrigger value="service">Service Catalog</TabsTrigger>
              <TabsTrigger value="manual">Manual Entry</TabsTrigger>
            </TabsList>
            
            <div className="flex-1 overflow-hidden">
              <TabsContent value="service" className="h-full mt-4">
                {renderServiceTab()}
              </TabsContent>
              
              <TabsContent value="manual" className="h-full mt-4 overflow-auto">
                {renderManualTab()}
              </TabsContent>
            </div>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
