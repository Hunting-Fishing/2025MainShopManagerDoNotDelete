import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { useEquipmentManagement } from '@/hooks/useEquipmentManagement';
import { EquipmentDetails } from '@/services/equipment/equipmentService';
import { Wrench, FileText, Image, Plus, X, Upload } from 'lucide-react';
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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">
              <Wrench className="h-4 w-4 mr-2" />
              Basic Info
            </TabsTrigger>
            <TabsTrigger value="specifications">
              <FileText className="h-4 w-4 mr-2" />
              Specifications
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
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Add technical specifications like oil type, filter numbers, capacities, etc.
                </p>
                <Button type="button" onClick={handleAddSpecification} size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Specification
                </Button>
              </div>

              <div className="space-y-3">
                {specifications.map((spec, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex gap-3 items-start">
                      <div className="flex-1 grid grid-cols-2 gap-3">
                        <Input
                          placeholder="Specification name (e.g., Oil Type)"
                          value={spec.key}
                          onChange={(e) => handleSpecificationChange(index, 'key', e.target.value)}
                        />
                        <Input
                          placeholder="Value (e.g., 5W-30 Synthetic)"
                          value={spec.value}
                          onChange={(e) => handleSpecificationChange(index, 'value', e.target.value)}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveSpecification(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}

                {specifications.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No specifications added yet</p>
                    <p className="text-xs mt-1">Click "Add Specification" to get started</p>
                  </div>
                )}
              </div>

              <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium mb-2">Common Specifications:</p>
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div>• Oil Type & Capacity</div>
                  <div>• Air Filter Part Number</div>
                  <div>• Fuel Filter Part Number</div>
                  <div>• Hydraulic Fluid Type</div>
                  <div>• Coolant Type & Capacity</div>
                  <div>• Tire Size & Pressure</div>
                  <div>• Battery Specifications</div>
                  <div>• Belt Part Numbers</div>
                </div>
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
