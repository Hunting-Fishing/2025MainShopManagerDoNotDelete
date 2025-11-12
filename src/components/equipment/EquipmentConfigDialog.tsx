import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useEquipmentManagement } from '@/hooks/useEquipmentManagement';
import { EquipmentDetails } from '@/services/equipment/equipmentService';
import { Wrench, FileText, Image, Plus, X, Upload, Settings, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface EquipmentConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  equipment: EquipmentDetails;
  onSave: () => void;
}

interface Specification {
  key: string;
  value: string;
}

interface MediaAttachment {
  id?: string;
  name: string;
  url: string;
  type: 'image' | 'video' | 'document';
}

interface EquipmentServiceItem {
  id?: string;
  item_name: string;
  item_type: string;
  inventory_id: string | null;
  part_number: string;
  quantity: number;
  hours_interval: number | null;
  mileage_interval: number | null;
  calendar_interval: number | null;
  calendar_interval_unit: string;
  item_category: string;
  position: string;
  notes: string;
  is_critical: boolean;
}

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  part_number: string;
  category: string;
  quantity: number;
  unit_price: number;
}

export function EquipmentConfigDialog({ open, onOpenChange, equipment, onSave }: EquipmentConfigDialogProps) {
  const { updateEquipment, loading } = useEquipmentManagement();
  const [uploading, setUploading] = useState(false);
  
  // Basic Info State
  const [formData, setFormData] = useState({
    name: equipment.name || '',
    model: equipment.model || '',
    manufacturer: equipment.manufacturer || '',
    serial_number: equipment.serial_number || '',
    location: equipment.location || '',
    status: equipment.status || 'operational',
    notes: equipment.notes || '',
    purchase_date: equipment.purchase_date || '',
    current_value: (equipment as any).current_value || 0,
  });

  // Specifications State
  const [specifications, setSpecifications] = useState<Specification[]>(() => {
    const specs = (equipment as any).specifications || {};
    return Object.entries(specs).map(([key, value]) => ({
      key,
      value: String(value)
    }));
  });

  // Media Attachments State
  const [attachments, setAttachments] = useState<MediaAttachment[]>([]);

  // Equipment Service Items State
  const [serviceItems, setServiceItems] = useState<EquipmentServiceItem[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [filteredInventory, setFilteredInventory] = useState<InventoryItem[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Fetch service items and inventory on mount
  useEffect(() => {
    if (open && equipment.id) {
      fetchServiceItems();
      fetchInventoryItems();
    }
  }, [open, equipment.id]);

  // Filter inventory by category
  useEffect(() => {
    if (categoryFilter === 'all') {
      setFilteredInventory(inventoryItems);
    } else {
      setFilteredInventory(inventoryItems.filter(item => 
        item.category?.toLowerCase() === categoryFilter.toLowerCase()
      ));
    }
  }, [categoryFilter, inventoryItems]);

  const fetchServiceItems = async () => {
    try {
      const { data, error } = await supabase
        .from('equipment_maintenance_items')
        .select('*')
        .eq('equipment_id', equipment.id);

      if (error) throw error;
      setServiceItems(data || []);
    } catch (error) {
      console.error('Error fetching service items:', error);
    }
  };

  const fetchInventoryItems = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select('id, name, sku, part_number, category, quantity, unit_price')
        .order('name');

      if (error) throw error;
      setInventoryItems(data || []);
      setFilteredInventory(data || []);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    }
  };

  const handleAddSpecification = () => {
    setSpecifications([...specifications, { key: '', value: '' }]);
  };

  const handleRemoveSpecification = (index: number) => {
    setSpecifications(specifications.filter((_, i) => i !== index));
  };

  const handleSpecificationChange = (index: number, field: 'key' | 'value', value: string) => {
    const updated = [...specifications];
    updated[index][field] = value;
    setSpecifications(updated);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${equipment.id}/${Date.now()}.${fileExt}`;
        const filePath = `equipment-media/${fileName}`;

        const { error: uploadError, data } = await supabase.storage
          .from('equipment_attachments')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('equipment_attachments')
          .getPublicUrl(filePath);

        const fileType = file.type.startsWith('image/') ? 'image' 
          : file.type.startsWith('video/') ? 'video' 
          : 'document';

        setAttachments(prev => [...prev, {
          name: file.name,
          url: publicUrl,
          type: fileType
        }]);
      }
      toast.success('Files uploaded successfully');
    } catch (error) {
      console.error('Error uploading files:', error);
      toast.error('Failed to upload files');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleAddServiceItem = () => {
    setServiceItems([...serviceItems, {
      item_name: '',
      item_type: 'filter',
      inventory_id: null,
      part_number: '',
      quantity: 1,
      hours_interval: null,
      mileage_interval: null,
      calendar_interval: null,
      calendar_interval_unit: 'days',
      item_category: '',
      position: '',
      notes: '',
      is_critical: false
    }]);
  };

  const handleRemoveServiceItem = async (index: number, id?: string) => {
    if (id) {
      try {
        const { error } = await supabase
          .from('equipment_maintenance_items')
          .delete()
          .eq('id', id);

        if (error) throw error;
        toast.success('Service item deleted');
      } catch (error) {
        console.error('Error deleting service item:', error);
        toast.error('Failed to delete service item');
        return;
      }
    }
    setServiceItems(serviceItems.filter((_, i) => i !== index));
  };

  const handleServiceItemChange = (index: number, field: keyof EquipmentServiceItem, value: any) => {
    const updated = [...serviceItems];
    updated[index][field] = value as never;

    // Auto-fill part number when inventory item is selected
    if (field === 'inventory_id' && value) {
      const inventoryItem = inventoryItems.find(item => item.id === value);
      if (inventoryItem) {
        updated[index].part_number = inventoryItem.part_number || inventoryItem.sku;
        updated[index].item_name = inventoryItem.name;
      }
    }

    setServiceItems(updated);
  };

  const saveServiceItems = async () => {
    try {
      // Delete all existing items for this equipment
      await supabase
        .from('equipment_maintenance_items')
        .delete()
        .eq('equipment_id', equipment.id);

      // Insert new items
      if (serviceItems.length > 0) {
        const itemsToInsert = serviceItems.map(item => ({
          ...item,
          equipment_id: equipment.id,
          id: undefined // Remove id for new inserts
        }));

        const { error } = await supabase
          .from('equipment_maintenance_items')
          .insert(itemsToInsert);

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error saving service items:', error);
      throw error;
    }
  };

  const handleSave = async () => {
    try {
      // Convert specifications array to object
      const specsObject = specifications.reduce((acc, spec) => {
        if (spec.key && spec.value) {
          acc[spec.key] = spec.value;
        }
        return acc;
      }, {} as Record<string, string>);

      // Prepare update data
      const updates = {
        ...formData,
        specifications: specsObject,
        attachments: attachments,
        updated_at: new Date().toISOString()
      };

      // Save service items first
      await saveServiceItems();

      // Update equipment
      await updateEquipment(equipment.id, updates);
      toast.success('Equipment updated successfully');
      onSave();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving equipment:', error);
      toast.error('Failed to update equipment');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configure Equipment - {equipment.name}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">
              <Wrench className="h-4 w-4 mr-2" />
              Basic Info
            </TabsTrigger>
            <TabsTrigger value="specifications">
              <FileText className="h-4 w-4 mr-2" />
              Specifications
            </TabsTrigger>
            <TabsTrigger value="maintenance">
              <Settings className="h-4 w-4 mr-2" />
              Maintenance Items
            </TabsTrigger>
            <TabsTrigger value="media">
              <Image className="h-4 w-4 mr-2" />
              Media & Files
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Equipment Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter equipment name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  placeholder="Enter model"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="manufacturer">Manufacturer</Label>
                <Input
                  id="manufacturer"
                  value={formData.manufacturer}
                  onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                  placeholder="Enter manufacturer"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="serial_number">Serial Number</Label>
                <Input
                  id="serial_number"
                  value={formData.serial_number}
                  onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
                  placeholder="Enter serial number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Enter location"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="operational">Operational</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="down">Down</SelectItem>
                    <SelectItem value="repair">Repair</SelectItem>
                    <SelectItem value="retired">Retired</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="purchase_date">Purchase Date</Label>
                <Input
                  id="purchase_date"
                  type="date"
                  value={formData.purchase_date?.split('T')[0] || ''}
                  onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="current_value">Current Value ($)</Label>
                <Input
                  id="current_value"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.current_value}
                  onChange={(e) => setFormData({ ...formData, current_value: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Enter any additional notes or comments"
                rows={4}
              />
            </div>
          </TabsContent>

          <TabsContent value="specifications" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <p className="text-sm text-muted-foreground">
                  Add technical specifications like oil type, filter numbers, capacities, etc.
                </p>
                <Button 
                  type="button" 
                  onClick={handleAddSpecification} 
                  size="default"
                  className="w-full sm:w-auto touch-manipulation"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Specification
                </Button>
              </div>

              <div className="space-y-3">
                {specifications.map((spec, index) => (
                  <Card key={index} className="border-2 hover:border-primary/50 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex gap-3 items-start">
                        <div className="flex-1 space-y-3">
                          <div className="space-y-2">
                            <Label htmlFor={`spec-key-${index}`} className="text-xs font-medium">
                              Specification Name
                            </Label>
                            <Input
                              id={`spec-key-${index}`}
                              placeholder="e.g., Oil Type"
                              value={spec.key}
                              onChange={(e) => handleSpecificationChange(index, 'key', e.target.value)}
                              className="h-12 text-base touch-manipulation"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`spec-value-${index}`} className="text-xs font-medium">
                              Value
                            </Label>
                            <Input
                              id={`spec-value-${index}`}
                              placeholder="e.g., 5W-30 Synthetic"
                              value={spec.value}
                              onChange={(e) => handleSpecificationChange(index, 'value', e.target.value)}
                              className="h-12 text-base touch-manipulation"
                            />
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveSpecification(index)}
                          className="h-10 w-10 mt-6 touch-manipulation shrink-0"
                        >
                          <X className="h-5 w-5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {specifications.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                    <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="font-medium">No specifications added yet</p>
                    <p className="text-xs mt-1">Click "Add Specification" or select from common specs below</p>
                  </div>
                )}
              </div>

              <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Quick Add Common Specifications
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Oil Type & Capacity',
                    'Air Filter Part Number',
                    'Fuel Filter Part Number',
                    'Hydraulic Fluid Type',
                    'Coolant Type & Capacity',
                    'Tire Size & Pressure',
                    'Battery Specifications',
                    'Belt Part Numbers',
                    'Engine Hours',
                    'Transmission Type',
                    'Hydraulic Pump Model',
                    'PTO Specifications'
                  ].map((specName) => (
                    <Button
                      key={specName}
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        const exists = specifications.some(s => s.key === specName);
                        if (!exists) {
                          setSpecifications([...specifications, { key: specName, value: '' }]);
                          toast.success(`Added "${specName}" specification`);
                        } else {
                          toast.info('This specification already exists');
                        }
                      }}
                      className="touch-manipulation text-xs"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      {specName}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="maintenance" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 flex-1">
                  <Label htmlFor="category-filter" className="whitespace-nowrap">Filter by Type:</Label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger id="category-filter" className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Items</SelectItem>
                      <SelectItem value="marine">Marine</SelectItem>
                      <SelectItem value="automotive">Automotive</SelectItem>
                      <SelectItem value="heavy equipment">Heavy Equipment</SelectItem>
                      <SelectItem value="filters">Filters</SelectItem>
                      <SelectItem value="oils & fluids">Oils & Fluids</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="button" onClick={handleAddServiceItem} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>

              {serviceItems.length > 0 ? (
                <Card>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[180px]">Item Name</TableHead>
                            <TableHead className="w-[120px]">Type</TableHead>
                            <TableHead className="w-[120px]">Position</TableHead>
                            <TableHead className="w-[200px]">Inventory Item</TableHead>
                            <TableHead className="w-[100px]">Part #</TableHead>
                            <TableHead className="w-[80px]">Qty</TableHead>
                            <TableHead className="w-[100px]">Hours</TableHead>
                            <TableHead className="w-[100px]">Mileage</TableHead>
                            <TableHead className="w-[120px]">Calendar</TableHead>
                            <TableHead className="w-[80px]">Critical</TableHead>
                            <TableHead className="w-[60px]"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {serviceItems.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                <Input
                                  value={item.item_name}
                                  onChange={(e) => handleServiceItemChange(index, 'item_name', e.target.value)}
                                  placeholder="Item name"
                                  className="h-8"
                                />
                              </TableCell>
                              <TableCell>
                                <Select
                                  value={item.item_type}
                                  onValueChange={(value) => handleServiceItemChange(index, 'item_type', value)}
                                >
                                  <SelectTrigger className="h-8">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="filter">Filter</SelectItem>
                                    <SelectItem value="oil">Oil</SelectItem>
                                    <SelectItem value="coolant">Coolant</SelectItem>
                                    <SelectItem value="belt">Belt</SelectItem>
                                    <SelectItem value="fluid">Fluid</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell>
                                <Select
                                  value={item.position}
                                  onValueChange={(value) => handleServiceItemChange(index, 'position', value)}
                                >
                                  <SelectTrigger className="h-8">
                                    <SelectValue placeholder="Position" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="">None</SelectItem>
                                    <SelectItem value="primary">Primary</SelectItem>
                                    <SelectItem value="secondary">Secondary</SelectItem>
                                    <SelectItem value="left">Left</SelectItem>
                                    <SelectItem value="right">Right</SelectItem>
                                    <SelectItem value="front">Front</SelectItem>
                                    <SelectItem value="rear">Rear</SelectItem>
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell>
                                <Select
                                  value={item.inventory_id || ''}
                                  onValueChange={(value) => handleServiceItemChange(index, 'inventory_id', value || null)}
                                >
                                  <SelectTrigger className="h-8">
                                    <SelectValue placeholder="Select item" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="">None</SelectItem>
                                    {filteredInventory.map((invItem) => (
                                      <SelectItem key={invItem.id} value={invItem.id}>
                                        {invItem.name} ({invItem.sku})
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell>
                                <Input
                                  value={item.part_number}
                                  onChange={(e) => handleServiceItemChange(index, 'part_number', e.target.value)}
                                  placeholder="Part #"
                                  className="h-8"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.1"
                                  value={item.quantity}
                                  onChange={(e) => handleServiceItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                                  className="h-8"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  min="0"
                                  value={item.hours_interval || ''}
                                  onChange={(e) => handleServiceItemChange(index, 'hours_interval', e.target.value ? parseInt(e.target.value) : null)}
                                  placeholder="hrs"
                                  className="h-8"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  min="0"
                                  value={item.mileage_interval || ''}
                                  onChange={(e) => handleServiceItemChange(index, 'mileage_interval', e.target.value ? parseInt(e.target.value) : null)}
                                  placeholder="mi/km"
                                  className="h-8"
                                />
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-1">
                                  <Input
                                    type="number"
                                    min="0"
                                    value={item.calendar_interval || ''}
                                    onChange={(e) => handleServiceItemChange(index, 'calendar_interval', e.target.value ? parseInt(e.target.value) : null)}
                                    placeholder="90"
                                    className="h-8 w-16"
                                  />
                                  <Select
                                    value={item.calendar_interval_unit}
                                    onValueChange={(value) => handleServiceItemChange(index, 'calendar_interval_unit', value)}
                                  >
                                    <SelectTrigger className="h-8 w-20">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="days">Days</SelectItem>
                                      <SelectItem value="weeks">Weeks</SelectItem>
                                      <SelectItem value="months">Months</SelectItem>
                                      <SelectItem value="years">Years</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </TableCell>
                              <TableCell className="text-center">
                                <Input
                                  type="checkbox"
                                  checked={item.is_critical}
                                  onChange={(e) => handleServiceItemChange(index, 'is_critical', e.target.checked)}
                                  className="h-4 w-4"
                                />
                              </TableCell>
                              <TableCell>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleRemoveServiceItem(index, item.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                  <Settings className="h-12 w-12 mx-auto mb-2 opacity-50 text-muted-foreground" />
                  <p className="text-muted-foreground">No maintenance items added yet</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Click "Add Item" to define parts and service intervals
                  </p>
                </div>
              )}

              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <p className="text-sm font-medium">Service Intervals Guide:</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• <strong>Hours:</strong> Service every X operating hours (e.g., 250 hours)</li>
                  <li>• <strong>Mileage:</strong> Service every X miles or kilometers (e.g., 5000 miles)</li>
                  <li>• <strong>Calendar:</strong> Service every X days/weeks/months (e.g., 90 days)</li>
                  <li>• <strong>Position:</strong> Use for multiple items (Primary/Secondary filters, Left/Right)</li>
                  <li>• <strong>Critical:</strong> Mark items that require immediate attention when due</li>
                </ul>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="media" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Upload photos, videos, manuals, and other documents
                </p>
                <div>
                  <Input
                    id="file-upload"
                    type="file"
                    multiple
                    accept="image/*,video/*,.pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    onClick={() => document.getElementById('file-upload')?.click()}
                    size="sm"
                    variant="outline"
                    disabled={uploading}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {uploading ? 'Uploading...' : 'Upload Files'}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {attachments.map((attachment, index) => (
                  <Card key={index} className="p-3 relative group">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveAttachment(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    
                    {attachment.type === 'image' && (
                      <img 
                        src={attachment.url} 
                        alt={attachment.name}
                        className="w-full h-32 object-cover rounded mb-2"
                      />
                    )}
                    {attachment.type === 'video' && (
                      <video 
                        src={attachment.url} 
                        className="w-full h-32 object-cover rounded mb-2"
                        controls
                      />
                    )}
                    {attachment.type === 'document' && (
                      <div className="w-full h-32 flex items-center justify-center bg-muted rounded mb-2">
                        <FileText className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                    <p className="text-xs truncate">{attachment.name}</p>
                  </Card>
                ))}
              </div>

              {attachments.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                  <Image className="h-12 w-12 mx-auto mb-2 opacity-50 text-muted-foreground" />
                  <p className="text-muted-foreground">No files uploaded yet</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Click "Upload Files" to add photos, videos, or documents
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading || uploading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading || uploading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
