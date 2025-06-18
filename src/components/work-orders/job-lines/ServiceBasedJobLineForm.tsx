
import React, { useState } from 'react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ServiceBasedJobLineFormProps {
  workOrderId: string;
  onSave: (jobLines: WorkOrderJobLine[]) => void;
  onCancel: () => void;
}

interface ServiceItem {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  description: string;
  estimatedHours: number;
  laborRate: number;
  totalAmount: number;
}

// Mock service data - in real app this would come from API
const mockServices: ServiceItem[] = [
  {
    id: '1',
    name: 'Oil Change Service',
    category: 'Maintenance',
    subcategory: 'Engine',
    description: 'Complete oil and filter change',
    estimatedHours: 0.5,
    laborRate: 120,
    totalAmount: 60
  },
  {
    id: '2',
    name: 'Brake Inspection',
    category: 'Safety',
    subcategory: 'Brakes',
    description: 'Comprehensive brake system inspection',
    estimatedHours: 1.0,
    laborRate: 120,
    totalAmount: 120
  },
  {
    id: '3',
    name: 'Tire Rotation',
    category: 'Maintenance',
    subcategory: 'Tires',
    description: 'Rotate and balance tires',
    estimatedHours: 0.75,
    laborRate: 100,
    totalAmount: 75
  }
];

export function ServiceBasedJobLineForm({
  workOrderId,
  onSave,
  onCancel
}: ServiceBasedJobLineFormProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('browse');
  const [selectedServices, setSelectedServices] = useState<ServiceItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [customJobLine, setCustomJobLine] = useState({
    name: '',
    category: '',
    subcategory: '',
    description: '',
    estimatedHours: 0,
    laborRate: 120,
    totalAmount: 0
  });

  const categories = ['all', 'Maintenance', 'Safety', 'Repair', 'Diagnostic'];
  
  const filteredServices = mockServices.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleServiceSelect = (service: ServiceItem) => {
    if (!selectedServices.find(s => s.id === service.id)) {
      setSelectedServices([...selectedServices, service]);
    }
  };

  const handleServiceRemove = (serviceId: string) => {
    setSelectedServices(selectedServices.filter(s => s.id !== serviceId));
  };

  const handleCustomJobLineChange = (field: string, value: any) => {
    const updated = { ...customJobLine, [field]: value };
    if (field === 'estimatedHours' || field === 'laborRate') {
      updated.totalAmount = updated.estimatedHours * updated.laborRate;
    }
    setCustomJobLine(updated);
  };

  const handleAddCustomJobLine = () => {
    if (!customJobLine.name) {
      toast({
        title: "Error",
        description: "Job line name is required",
        variant: "destructive"
      });
      return;
    }

    const newService: ServiceItem = {
      id: `custom-${Date.now()}`,
      name: customJobLine.name,
      category: customJobLine.category || 'Custom',
      subcategory: customJobLine.subcategory || '',
      description: customJobLine.description,
      estimatedHours: customJobLine.estimatedHours,
      laborRate: customJobLine.laborRate,
      totalAmount: customJobLine.totalAmount
    };

    setSelectedServices([...selectedServices, newService]);
    setCustomJobLine({
      name: '',
      category: '',
      subcategory: '',
      description: '',
      estimatedHours: 0,
      laborRate: 120,
      totalAmount: 0
    });
    setActiveTab('selected');
  };

  const handleSave = () => {
    if (selectedServices.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one service",
        variant: "destructive"
      });
      return;
    }

    const jobLines: WorkOrderJobLine[] = selectedServices.map((service, index) => ({
      id: `temp-${Date.now()}-${index}`,
      work_order_id: workOrderId,
      name: service.name,
      category: service.category,
      subcategory: service.subcategory,
      description: service.description,
      estimated_hours: service.estimatedHours,
      labor_rate: service.laborRate,
      total_amount: service.totalAmount,
      status: 'pending',
      display_order: index,
      labor_rate_type: 'standard'
    }));

    onSave(jobLines);
  };

  const totalAmount = selectedServices.reduce((sum, service) => sum + service.totalAmount, 0);
  const totalHours = selectedServices.reduce((sum, service) => sum + service.estimatedHours, 0);

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="browse">Browse Services</TabsTrigger>
          <TabsTrigger value="custom">Add Custom</TabsTrigger>
          <TabsTrigger value="selected" className="relative">
            Selected Services
            {selectedServices.length > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                {selectedServices.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-3 max-h-96 overflow-y-auto">
            {filteredServices.map(service => (
              <Card key={service.id} className="cursor-pointer hover:bg-accent/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">{service.name}</h4>
                        <Badge variant="outline" className="text-xs">
                          {service.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{service.description}</p>
                      <div className="flex gap-4 text-sm">
                        <span>Hours: {service.estimatedHours}</span>
                        <span>Rate: ${service.laborRate}/hr</span>
                        <span className="font-medium">Total: ${service.totalAmount}</span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleServiceSelect(service)}
                      disabled={selectedServices.some(s => s.id === service.id)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="custom" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create Custom Job Line</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name *</label>
                  <Input
                    value={customJobLine.name}
                    onChange={(e) => handleCustomJobLineChange('name', e.target.value)}
                    placeholder="Enter job line name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <Input
                    value={customJobLine.category}
                    onChange={(e) => handleCustomJobLineChange('category', e.target.value)}
                    placeholder="Enter category"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <Textarea
                  value={customJobLine.description}
                  onChange={(e) => handleCustomJobLineChange('description', e.target.value)}
                  placeholder="Enter description"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Estimated Hours</label>
                  <Input
                    type="number"
                    step="0.25"
                    value={customJobLine.estimatedHours}
                    onChange={(e) => handleCustomJobLineChange('estimatedHours', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Labor Rate ($/hr)</label>
                  <Input
                    type="number"
                    value={customJobLine.laborRate}
                    onChange={(e) => handleCustomJobLineChange('laborRate', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Total Amount</label>
                  <Input
                    type="number"
                    value={customJobLine.totalAmount}
                    readOnly
                    className="bg-muted"
                  />
                </div>
              </div>

              <Button onClick={handleAddCustomJobLine} className="w-full">
                Add Custom Job Line
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="selected" className="space-y-4">
          {selectedServices.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No services selected yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Browse services or add a custom job line to get started
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid gap-3">
                {selectedServices.map(service => (
                  <Card key={service.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{service.name}</h4>
                            <Badge variant="outline" className="text-xs">
                              {service.category}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{service.description}</p>
                          <div className="flex gap-4 text-sm">
                            <span>Hours: {service.estimatedHours}</span>
                            <span>Rate: ${service.laborRate}/hr</span>
                            <span className="font-medium">Total: ${service.totalAmount}</span>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleServiceRemove(service.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div className="text-sm">
                      <span className="font-medium">{selectedServices.length} services selected</span>
                      <span className="text-muted-foreground ml-4">
                        Total: {totalHours.toFixed(1)} hours • ${totalAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={selectedServices.length === 0}>
          Add Job Lines ({selectedServices.length})
        </Button>
      </div>
    </div>
  );
}
