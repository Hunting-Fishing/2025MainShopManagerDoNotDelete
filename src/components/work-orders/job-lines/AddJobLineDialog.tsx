
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { WorkOrderJobLine } from "@/types/jobLine";
import { ServiceJob } from "@/types/serviceHierarchy";
import { SelectedService } from "@/types/selectedService";
import { ServicesSection } from "../fields/ServicesSection";

export interface AddJobLineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddJobLine: (newJobLine: Omit<WorkOrderJobLine, "id" | "createdAt" | "updatedAt">) => void;
  shopId?: string;
  maxSelections?: number;
}

export const AddJobLineDialog: React.FC<AddJobLineDialogProps> = ({
  open,
  onOpenChange,
  onAddJobLine,
  maxSelections = 1
}) => {
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
  const [manualEntry, setManualEntry] = useState({
    name: "",
    description: "",
    estimatedHours: 0,
    laborRate: 0
  });

  const handleServiceSelect = (service: ServiceJob, categoryName: string, subcategoryName: string) => {
    const newService: SelectedService = {
      id: service.id,
      serviceId: service.id,
      name: service.name,
      description: service.description,
      categoryName,
      subcategoryName,
      estimatedTime: service.estimatedTime,
      price: service.price
    };

    if (selectedServices.length < maxSelections) {
      setSelectedServices([...selectedServices, newService]);
    }
  };

  const handleRemoveService = (serviceId: string) => {
    setSelectedServices(prev => prev.filter(s => s.id !== serviceId));
  };

  const handleUpdateServices = (services: SelectedService[]) => {
    setSelectedServices(services);
  };

  const handleAddJobLine = () => {
    if (selectedServices.length > 0) {
      // Add selected services as job lines
      selectedServices.forEach(service => {
        const jobLine: Omit<WorkOrderJobLine, "id" | "createdAt" | "updatedAt"> = {
          name: service.name,
          category: service.categoryName,
          subcategory: service.subcategoryName,
          description: service.description,
          estimatedHours: service.estimatedTime ? service.estimatedTime / 60 : 0,
          laborRate: service.price || 0,
          totalAmount: service.price || 0,
          status: 'pending'
        };
        onAddJobLine(jobLine);
      });
    } else if (manualEntry.name) {
      // Add manual entry as job line
      const jobLine: Omit<WorkOrderJobLine, "id" | "createdAt" | "updatedAt"> = {
        name: manualEntry.name,
        description: manualEntry.description,
        estimatedHours: manualEntry.estimatedHours,
        laborRate: manualEntry.laborRate,
        totalAmount: manualEntry.estimatedHours * manualEntry.laborRate,
        status: 'pending'
      };
      onAddJobLine(jobLine);
    }

    // Reset form
    setSelectedServices([]);
    setManualEntry({ name: "", description: "", estimatedHours: 0, laborRate: 0 });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Job Line</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">Select from Service Catalog</h3>
            <ServicesSection
              onServiceSelect={handleServiceSelect}
              selectedServices={selectedServices}
              onUpdateServices={handleUpdateServices}
            />
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-medium mb-4">Or Enter Manually</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Service Name</Label>
                <Input
                  id="name"
                  value={manualEntry.name}
                  onChange={(e) => setManualEntry(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter service name"
                />
              </div>
              <div>
                <Label htmlFor="estimatedHours">Estimated Hours</Label>
                <Input
                  id="estimatedHours"
                  type="number"
                  step="0.5"
                  value={manualEntry.estimatedHours}
                  onChange={(e) => setManualEntry(prev => ({ ...prev, estimatedHours: parseFloat(e.target.value) || 0 }))}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="laborRate">Labor Rate</Label>
                <Input
                  id="laborRate"
                  type="number"
                  step="0.01"
                  value={manualEntry.laborRate}
                  onChange={(e) => setManualEntry(prev => ({ ...prev, laborRate: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={manualEntry.description}
                  onChange={(e) => setManualEntry(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter description"
                  rows={3}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddJobLine}
              disabled={selectedServices.length === 0 && !manualEntry.name}
            >
              Add Job Line
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
