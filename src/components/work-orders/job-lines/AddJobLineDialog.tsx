
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { IntegratedServiceSelector } from "@/components/work-orders/fields/services/IntegratedServiceSelector";
import { WorkOrderJobLine } from "@/types/jobLine";
import { ServiceMainCategory, ServiceJob } from "@/types/serviceHierarchy";
import { SelectedService } from "@/types/selectedService";
import { fetchServiceCategories } from "@/lib/services/serviceApi";
import { toast } from "@/hooks/use-toast";

interface AddJobLineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddJobLine: (jobLine: Omit<WorkOrderJobLine, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

export const AddJobLineDialog: React.FC<AddJobLineDialogProps> = ({
  open,
  onOpenChange,
  onAddJobLine
}) => {
  const [serviceCategories, setServiceCategories] = useState<ServiceMainCategory[]>([]);
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    estimatedHours: 0,
    laborRate: 0,
    notes: ""
  });

  useEffect(() => {
    if (open) {
      loadServiceCategories();
    }
  }, [open]);

  const loadServiceCategories = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const categories = await fetchServiceCategories();
      setServiceCategories(categories);
    } catch (err) {
      console.error("Failed to load service categories:", err);
      setError("Failed to load service categories. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleServiceSelect = (service: ServiceJob, categoryName: string, subcategoryName: string) => {
    // Auto-populate form when service is selected
    setFormData(prev => ({
      ...prev,
      name: service.name,
      description: service.description || "",
      estimatedHours: service.estimatedTime ? service.estimatedTime / 60 : 0, // Convert minutes to hours
      laborRate: prev.laborRate || 75 // Default labor rate
    }));
  };

  const handleUpdateServices = (services: SelectedService[]) => {
    setSelectedServices(services);
    
    // If a service is selected, auto-populate the form
    if (services.length > 0) {
      const lastSelected = services[services.length - 1];
      setFormData(prev => ({
        ...prev,
        name: lastSelected.name,
        description: lastSelected.description || ""
      }));
    }
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a job line name or select a service",
        variant: "destructive"
      });
      return;
    }

    const selectedService = selectedServices[0];
    const jobLine: Omit<WorkOrderJobLine, 'id' | 'createdAt' | 'updatedAt'> = {
      name: formData.name,
      category: selectedService?.categoryName,
      subcategory: selectedService?.subcategoryName,
      description: formData.description,
      estimatedHours: formData.estimatedHours,
      laborRate: formData.laborRate,
      totalAmount: formData.estimatedHours * formData.laborRate,
      status: 'pending',
      notes: formData.notes
    };

    onAddJobLine(jobLine);
    
    // Reset form
    setFormData({
      name: "",
      description: "",
      estimatedHours: 0,
      laborRate: 0,
      notes: ""
    });
    setSelectedServices([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Job Line</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Service Selection */}
          <div>
            <Label className="text-base font-medium">Select Service (Optional)</Label>
            <p className="text-sm text-gray-500 mb-4">
              Choose a service to auto-populate the job line details, or create a custom job line below.
            </p>
            
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Loading services...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-500">{error}</p>
                <Button onClick={loadServiceCategories} variant="outline" className="mt-2">
                  Retry
                </Button>
              </div>
            ) : (
              <IntegratedServiceSelector
                categories={serviceCategories}
                onServiceSelect={handleServiceSelect}
                selectedServices={selectedServices}
                onRemoveService={(serviceId) => {
                  setSelectedServices(prev => prev.filter(s => s.id !== serviceId));
                }}
                onUpdateServices={handleUpdateServices}
                maxSelections={1}
              />
            )}
          </div>

          {/* Manual Job Line Form */}
          <div className="border-t pt-6">
            <Label className="text-base font-medium mb-4 block">Job Line Details</Label>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Job Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter job name"
                />
              </div>
              
              <div>
                <Label htmlFor="estimatedHours">Estimated Hours</Label>
                <Input
                  id="estimatedHours"
                  type="number"
                  min="0"
                  step="0.25"
                  value={formData.estimatedHours}
                  onChange={(e) => setFormData(prev => ({ ...prev, estimatedHours: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.0"
                />
              </div>
              
              <div>
                <Label htmlFor="laborRate">Labor Rate ($/hour)</Label>
                <Input
                  id="laborRate"
                  type="number"
                  min="0"
                  step="1"
                  value={formData.laborRate}
                  onChange={(e) => setFormData(prev => ({ ...prev, laborRate: parseFloat(e.target.value) || 0 }))}
                  placeholder="75"
                />
              </div>
              
              <div>
                <Label>Total Amount</Label>
                <Input
                  value={`$${(formData.estimatedHours * formData.laborRate).toFixed(2)}`}
                  disabled
                  className="bg-gray-50"
                />
              </div>
            </div>
            
            <div className="mt-4">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter job description"
                rows={3}
              />
            </div>
            
            <div className="mt-4">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes"
                rows={2}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              Add Job Line
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
