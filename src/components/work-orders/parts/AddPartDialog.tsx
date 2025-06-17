
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WorkOrderPart } from '@/types/workOrderPart';
import { createWorkOrderPart } from '@/services/workOrder/workOrderPartsService';
import { toast } from '@/hooks/use-toast';

interface AddPartDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workOrderId: string;
  jobLineId: string;
  onPartAdded: (part: WorkOrderPart) => void;
}

export function AddPartDialog({
  open,
  onOpenChange,
  workOrderId,
  jobLineId,
  onPartAdded
}: AddPartDialogProps) {
  const [activeTab, setActiveTab] = useState<'inventory' | 'non-inventory'>('inventory');
  const [isLoading, setIsLoading] = useState(false);
  
  // Form state for non-inventory parts
  const [partForm, setPartForm] = useState({
    name: '',
    part_number: '',
    description: '',
    quantity: 1,
    unit_price: 0,
    status: 'pending'
  });

  // Mock inventory items - in real app, fetch from inventory
  const [inventoryItems] = useState([
    { id: '1', name: 'Air Filter', part_number: 'AF-123', price: 25.99, stock: 10 },
    { id: '2', name: 'Oil Filter', part_number: 'OF-456', price: 12.50, stock: 15 },
    { id: '3', name: 'Brake Pads', part_number: 'BP-789', price: 89.99, stock: 5 },
  ]);

  const [selectedInventoryItem, setSelectedInventoryItem] = useState<string>('');
  const [inventoryQuantity, setInventoryQuantity] = useState(1);

  const handleAddInventoryPart = async () => {
    if (!selectedInventoryItem) {
      toast({
        title: "Error",
        description: "Please select an inventory item",
        variant: "destructive"
      });
      return;
    }

    const item = inventoryItems.find(i => i.id === selectedInventoryItem);
    if (!item) return;

    setIsLoading(true);
    try {
      const newPart: Partial<WorkOrderPart> = {
        work_order_id: workOrderId,
        job_line_id: jobLineId,
        name: item.name,
        part_number: item.part_number,
        quantity: inventoryQuantity,
        unit_price: item.price,
        total_price: item.price * inventoryQuantity,
        status: 'pending'
      };

      const createdPart = await createWorkOrderPart(newPart);
      onPartAdded(createdPart);
      onOpenChange(false);
      
      // Reset form
      setSelectedInventoryItem('');
      setInventoryQuantity(1);
      
      toast({
        title: "Success",
        description: "Part added successfully",
      });
    } catch (error) {
      console.error('Error adding inventory part:', error);
      toast({
        title: "Error",
        description: "Failed to add part",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddNonInventoryPart = async () => {
    if (!partForm.name || !partForm.part_number) {
      toast({
        title: "Error",
        description: "Please fill in required fields",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const newPart: Partial<WorkOrderPart> = {
        work_order_id: workOrderId,
        job_line_id: jobLineId,
        name: partForm.name,
        part_number: partForm.part_number,
        description: partForm.description,
        quantity: partForm.quantity,
        unit_price: partForm.unit_price,
        total_price: partForm.unit_price * partForm.quantity,
        status: partForm.status
      };

      const createdPart = await createWorkOrderPart(newPart);
      onPartAdded(createdPart);
      onOpenChange(false);
      
      // Reset form
      setPartForm({
        name: '',
        part_number: '',
        description: '',
        quantity: 1,
        unit_price: 0,
        status: 'pending'
      });
      
      toast({
        title: "Success",
        description: "Part added successfully",
      });
    } catch (error) {
      console.error('Error adding non-inventory part:', error);
      toast({
        title: "Error",
        description: "Failed to add part",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Part to Job Line</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'inventory' | 'non-inventory')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="inventory">From Inventory</TabsTrigger>
            <TabsTrigger value="non-inventory">Non-Inventory Part</TabsTrigger>
          </TabsList>

          <TabsContent value="inventory" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="inventory-item">Select Inventory Item</Label>
                <Select value={selectedInventoryItem} onValueChange={setSelectedInventoryItem}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an inventory item" />
                  </SelectTrigger>
                  <SelectContent>
                    {inventoryItems.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        <div className="flex justify-between items-center w-full">
                          <span>{item.name} ({item.part_number})</span>
                          <span className="text-muted-foreground ml-2">
                            ${item.price} - Stock: {item.stock}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedInventoryItem && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Selected Item Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const item = inventoryItems.find(i => i.id === selectedInventoryItem);
                      return item ? (
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div><strong>Name:</strong> {item.name}</div>
                          <div><strong>Part Number:</strong> {item.part_number}</div>
                          <div><strong>Price:</strong> ${item.price}</div>
                          <div><strong>Available:</strong> {item.stock}</div>
                        </div>
                      ) : null;
                    })()}
                  </CardContent>
                </Card>
              )}

              <div>
                <Label htmlFor="inventory-quantity">Quantity</Label>
                <Input
                  id="inventory-quantity"
                  type="number"
                  min="1"
                  value={inventoryQuantity}
                  onChange={(e) => setInventoryQuantity(parseInt(e.target.value) || 1)}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddInventoryPart} disabled={isLoading || !selectedInventoryItem}>
                  {isLoading ? 'Adding...' : 'Add Part'}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="non-inventory" className="space-y-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="part-name">Part Name *</Label>
                  <Input
                    id="part-name"
                    value={partForm.name}
                    onChange={(e) => setPartForm({ ...partForm, name: e.target.value })}
                    placeholder="Enter part name"
                  />
                </div>
                <div>
                  <Label htmlFor="part-number">Part Number *</Label>
                  <Input
                    id="part-number"
                    value={partForm.part_number}
                    onChange={(e) => setPartForm({ ...partForm, part_number: e.target.value })}
                    placeholder="Enter part number"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={partForm.description}
                  onChange={(e) => setPartForm({ ...partForm, description: e.target.value })}
                  placeholder="Enter part description"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={partForm.quantity}
                    onChange={(e) => setPartForm({ ...partForm, quantity: parseInt(e.target.value) || 1 })}
                  />
                </div>
                <div>
                  <Label htmlFor="unit-price">Unit Price</Label>
                  <Input
                    id="unit-price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={partForm.unit_price}
                    onChange={(e) => setPartForm({ ...partForm, unit_price: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={partForm.status} onValueChange={(value) => setPartForm({ ...partForm, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="ordered">Ordered</SelectItem>
                      <SelectItem value="received">Received</SelectItem>
                      <SelectItem value="installed">Installed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="p-3 bg-muted/50 rounded">
                <div className="text-sm">
                  <strong>Total: ${(partForm.unit_price * partForm.quantity).toFixed(2)}</strong>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddNonInventoryPart} disabled={isLoading || !partForm.name || !partForm.part_number}>
                  {isLoading ? 'Adding...' : 'Add Part'}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
