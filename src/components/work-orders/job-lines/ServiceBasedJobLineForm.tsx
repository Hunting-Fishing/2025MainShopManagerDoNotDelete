
import React, { useState } from 'react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { ServiceJob } from '@/types/service';
import { SelectedService } from '@/types/selectedService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { IntegratedServiceSelector } from '@/components/work-orders/fields/services/IntegratedServiceSelector';
import { useServiceSectors } from '@/hooks/useServiceCategories';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface ServiceBasedJobLineFormProps {
  workOrderId: string;
  onSave: (jobLines: WorkOrderJobLine[]) => void;
  onCancel: () => void;
}

export function ServiceBasedJobLineForm({
  workOrderId,
  onSave,
  onCancel
}: ServiceBasedJobLineFormProps) {
  const { sectors, loading, error } = useServiceSectors();
  const { toast } = useToast();
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('services');

  // Manual job line form state
  const [manualJobLine, setManualJobLine] = useState({
    name: '',
    category: '',
    subcategory: '',
    description: '',
    estimated_hours: 1,
    labor_rate: 100,
    labor_rate_type: 'standard',
    status: 'pending',
    notes: ''
  });

  const handleServiceSelect = (service: ServiceJob, categoryName: string, subcategoryName: string) => {
    console.log('Service selected:', service.name, categoryName, subcategoryName);
  };

  const handleRemoveService = (serviceId: string) => {
    const updatedServices = selectedServices.filter(s => s.id !== serviceId);
    setSelectedServices(updatedServices);
  };

  const handleUpdateServices = (services: SelectedService[]) => {
    setSelectedServices(services);
  };

  const handleManualInputChange = (field: string, value: any) => {
    setManualJobLine(prev => ({ ...prev, [field]: value }));
  };

  const calculateTotalAmount = (hours: number, rate: number) => {
    return hours * rate;
  };

  const handleSaveServices = async () => {
    if (selectedServices.length === 0) {
      toast({
        title: "No Services Selected",
        description: "Please select at least one service",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      const savedJobLines: WorkOrderJobLine[] = [];
      
      for (let index = 0; index < selectedServices.length; index++) {
        const service = selectedServices[index];
        
        const jobLineData = {
          work_order_id: workOrderId,
          name: service.name,
          category: service.category,
          subcategory: service.subcategory,
          description: service.description || '',
          estimated_hours: service.estimated_hours || 1,
          labor_rate: service.labor_rate || 100,
          labor_rate_type: 'standard',
          total_amount: service.total_amount || (service.labor_rate || 100),
          status: service.status || 'pending',
          display_order: index,
          notes: ''
        };

        console.log('Saving job line:', jobLineData);

        // Save directly to database
        const { data, error } = await supabase
          .from('work_order_job_lines')
          .insert([jobLineData])
          .select()
          .single();

        if (error) {
          console.error('Database error:', error);
          throw error;
        }

        savedJobLines.push(data);
      }

      toast({
        title: "Success",
        description: `Added ${savedJobLines.length} job line${savedJobLines.length !== 1 ? 's' : ''} successfully`,
      });

      onSave(savedJobLines);
    } catch (error) {
      console.error('Error saving job lines:', error);
      toast({
        title: "Error",
        description: "Failed to save job lines",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveManual = async () => {
    if (!manualJobLine.name.trim()) {
      toast({
        title: "Missing Information",
        description: "Job line name is required",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      const totalAmount = calculateTotalAmount(manualJobLine.estimated_hours, manualJobLine.labor_rate);
      
      const jobLineData = {
        work_order_id: workOrderId,
        name: manualJobLine.name,
        category: manualJobLine.category,
        subcategory: manualJobLine.subcategory,
        description: manualJobLine.description,
        estimated_hours: manualJobLine.estimated_hours,
        labor_rate: manualJobLine.labor_rate,
        labor_rate_type: manualJobLine.labor_rate_type,
        total_amount: totalAmount,
        status: manualJobLine.status,
        display_order: 0,
        notes: manualJobLine.notes
      };

      console.log('Saving manual job line:', jobLineData);

      // Save directly to database
      const { data, error } = await supabase
        .from('work_order_job_lines')
        .insert([jobLineData])
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      toast({
        title: "Success",
        description: "Job line added successfully",
      });

      onSave([data]);
    } catch (error) {
      console.error('Error saving manual job line:', error);
      toast({
        title: "Error",
        description: "Failed to save job line",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Loading services...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
        <Button onClick={() => window.location.reload()} variant="outline" className="mt-2">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="services">From Service Catalog</TabsTrigger>
          <TabsTrigger value="manual">Manual Entry</TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Select Services for Job Lines</CardTitle>
            </CardHeader>
            <CardContent>
              {sectors.length === 0 ? (
                <div className="text-center py-8 border rounded-md bg-gray-50">
                  <p className="text-gray-500">No services available</p>
                  <p className="text-sm text-gray-400">Contact your administrator to set up services</p>
                </div>
              ) : (
                <IntegratedServiceSelector
                  sectors={sectors}
                  onServiceSelect={handleServiceSelect}
                  selectedServices={selectedServices}
                  onRemoveService={handleRemoveService}
                  onUpdateServices={handleUpdateServices}
                />
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onCancel} disabled={isSaving}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveServices}
              disabled={selectedServices.length === 0 || isSaving}
            >
              {isSaving ? 'Saving...' : `Add ${selectedServices.length} Job Line${selectedServices.length !== 1 ? 's' : ''}`}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="manual" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create Manual Job Line</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Job Line Name *</label>
                    <Input
                      value={manualJobLine.name}
                      onChange={(e) => handleManualInputChange('name', e.target.value)}
                      placeholder="Enter job line name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Category</label>
                    <Input
                      value={manualJobLine.category}
                      onChange={(e) => handleManualInputChange('category', e.target.value)}
                      placeholder="Enter category"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Subcategory</label>
                    <Input
                      value={manualJobLine.subcategory}
                      onChange={(e) => handleManualInputChange('subcategory', e.target.value)}
                      placeholder="Enter subcategory"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Status</label>
                    <Select value={manualJobLine.status} onValueChange={(value) => handleManualInputChange('status', value)}>
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
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Estimated Hours</label>
                    <Input
                      type="number"
                      step="0.25"
                      min="0"
                      value={manualJobLine.estimated_hours}
                      onChange={(e) => handleManualInputChange('estimated_hours', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Labor Rate</label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={manualJobLine.labor_rate}
                      onChange={(e) => handleManualInputChange('labor_rate', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Total Amount</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={calculateTotalAmount(manualJobLine.estimated_hours, manualJobLine.labor_rate).toFixed(2)}
                      readOnly
                      className="bg-gray-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <Textarea
                    value={manualJobLine.description}
                    onChange={(e) => handleManualInputChange('description', e.target.value)}
                    placeholder="Enter job description"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Notes</label>
                  <Textarea
                    value={manualJobLine.notes}
                    onChange={(e) => handleManualInputChange('notes', e.target.value)}
                    placeholder="Enter any additional notes"
                    rows={2}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onCancel} disabled={isSaving}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveManual}
              disabled={!manualJobLine.name.trim() || isSaving}
            >
              {isSaving ? 'Saving...' : 'Add Job Line'}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
