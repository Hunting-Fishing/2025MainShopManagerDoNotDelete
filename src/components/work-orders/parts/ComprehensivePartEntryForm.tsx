
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, Package, Calculator, Truck, FileText, Shield } from 'lucide-react';
import { WorkOrderPartFormValues } from '@/types/workOrderPart';
import { CategorySelector } from './CategorySelector';
import { SupplierSelector } from './SupplierSelector';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface ComprehensivePartEntryFormProps {
  onPartAdd: (partData: WorkOrderPartFormValues) => void;
  onCancel: () => void;
  isLoading?: boolean;
  workOrderId?: string;
  jobLineId?: string;
}

export function ComprehensivePartEntryForm({
  onPartAdd,
  onCancel,
  isLoading = false,
  workOrderId,
  jobLineId
}: ComprehensivePartEntryFormProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('inventory');
  const [selectedInventoryItems, setSelectedInventoryItems] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors }
  } = useForm<WorkOrderPartFormValues>({
    defaultValues: {
      name: '',
      part_number: '',
      description: '',
      quantity: 1,
      unit_price: 0,
      status: 'pending',
      notes: '',
      category: '',
      supplierName: '',
      supplierCost: 0,
      customerPrice: 0,
      retailPrice: 0,
      markupPercentage: 0,
      isTaxable: true,
      coreChargeAmount: 0,
      coreChargeApplied: false,
      warrantyDuration: '',
      invoiceNumber: '',
      poLine: '',
      isStockItem: false,
      notesInternal: '',
      partType: 'part'
    }
  });

  // Watch fields for auto-calculations
  const supplierCost = watch('supplierCost') || 0;
  const markupPercentage = watch('markupPercentage') || 0;
  const quantity = watch('quantity') || 1;
  const unitPrice = watch('unit_price') || 0;

  // Auto-calculate retail price based on supplier cost and markup
  React.useEffect(() => {
    if (supplierCost > 0 && markupPercentage > 0) {
      const retailPrice = supplierCost * (1 + markupPercentage / 100);
      setValue('retailPrice', Number(retailPrice.toFixed(2)));
      setValue('customerPrice', Number(retailPrice.toFixed(2)));
      setValue('unit_price', Number(retailPrice.toFixed(2)));
    }
  }, [supplierCost, markupPercentage, setValue]);

  const handleInventoryItemAdd = (item: any) => {
    setSelectedInventoryItems(prev => [...prev, { ...item, quantity: 1 }]);
  };

  const handleInventoryItemRemove = (itemId: string) => {
    setSelectedInventoryItems(prev => prev.filter(item => item.id !== itemId));
  };

  const handleInventoryItemQuantityChange = (itemId: string, quantity: number) => {
    setSelectedInventoryItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, quantity: Math.max(1, quantity) } : item
      )
    );
  };

  const addInventoryItemsAsWorkOrderParts = async () => {
    if (selectedInventoryItems.length === 0) {
      toast({
        title: "No items selected",
        description: "Please select at least one inventory item to add.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Add each selected inventory item as a work order part
      for (const item of selectedInventoryItems) {
        const partData: WorkOrderPartFormValues = {
          name: item.name,
          part_number: item.sku || item.part_number || '',
          description: item.description || '',
          quantity: item.quantity,
          unit_price: item.unit_price || item.cost_price || 0,
          status: 'pending',
          category: item.category || '',
          supplierName: item.supplier || '',
          supplierCost: item.cost_price || 0,
          customerPrice: item.unit_price || item.cost_price || 0,
          retailPrice: item.unit_price || item.cost_price || 0,
          markupPercentage: 0,
          isTaxable: true,
          coreChargeAmount: 0,
          coreChargeApplied: false,
          isStockItem: true,
          partType: 'part',
          inventoryItemId: item.id
        };

        // Insert into work_order_parts table
        if (workOrderId) {
          const { error } = await supabase
            .from('work_order_parts')
            .insert({
              work_order_id: workOrderId,
              job_line_id: jobLineId || null,
              inventory_item_id: item.id,
              part_name: partData.name,
              part_number: partData.part_number,
              description: partData.description,
              quantity: partData.quantity,
              unit_price: partData.unit_price,
              customer_price: partData.customerPrice,
              supplier_name: partData.supplierName,
              supplier_cost: partData.supplierCost,
              retail_price: partData.retailPrice,
              markup_percentage: partData.markupPercentage,
              category: partData.category,
              is_taxable: partData.isTaxable,
              core_charge_amount: partData.coreChargeAmount,
              core_charge_applied: partData.coreChargeApplied,
              part_type: partData.partType,
              status: partData.status,
              notes: partData.notes,
              is_stock_item: partData.isStockItem
            });

          if (error) {
            console.error('Error inserting work order part:', error);
            throw error;
          }
        }

        // Call the callback
        onPartAdd(partData);
      }

      toast({
        title: "Parts added successfully",
        description: `Added ${selectedInventoryItems.length} parts to the work order.`
      });

      // Reset form
      setSelectedInventoryItems([]);
      onCancel();
      
    } catch (error) {
      console.error('Error adding inventory parts:', error);
      toast({
        title: "Error adding parts",
        description: "Failed to add parts to the work order. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit = async (data: WorkOrderPartFormValues) => {
    setIsSubmitting(true);
    try {
      console.log('Submitting part data:', data);

      // Ensure required fields are populated
      const partData: WorkOrderPartFormValues = {
        ...data,
        name: data.name || 'Unnamed Part',
        part_number: data.part_number || '',
        quantity: data.quantity || 1,
        unit_price: data.unit_price || data.customerPrice || 0,
        customerPrice: data.customerPrice || data.unit_price || 0,
        supplierCost: data.supplierCost || 0,
        retailPrice: data.retailPrice || data.unit_price || data.customerPrice || 0,
        markupPercentage: data.markupPercentage || 0,
        status: data.status || 'pending',
        partType: data.partType || 'part'
      };

      // Insert into work_order_parts table if workOrderId is provided
      if (workOrderId) {
        const { data: insertedPart, error } = await supabase
          .from('work_order_parts')
          .insert({
            work_order_id: workOrderId,
            job_line_id: jobLineId || null,
            inventory_item_id: partData.inventoryItemId || null,
            part_name: partData.name,
            part_number: partData.part_number,
            description: partData.description,
            quantity: partData.quantity,
            unit_price: partData.unit_price,
            customer_price: partData.customerPrice,
            supplier_name: partData.supplierName,
            supplier_cost: partData.supplierCost,
            retail_price: partData.retailPrice,
            markup_percentage: partData.markupPercentage,
            category: partData.category,
            is_taxable: partData.isTaxable,
            core_charge_amount: partData.coreChargeAmount,
            core_charge_applied: partData.coreChargeApplied,
            warranty_duration: partData.warrantyDuration,
            invoice_number: partData.invoiceNumber,
            po_line: partData.poLine,
            part_type: partData.partType,
            status: partData.status,
            notes: partData.notes,
            notes_internal: partData.notesInternal,
            is_stock_item: partData.isStockItem
          })
          .select()
          .single();

        if (error) {
          console.error('Error inserting work order part:', error);
          throw error;
        }

        console.log('Part inserted successfully:', insertedPart);
      }

      // Call the callback with the part data
      onPartAdd(partData);

      toast({
        title: "Part added successfully",
        description: "The part has been added to the work order."
      });

      // Reset form
      reset();
      onCancel();
      
    } catch (error) {
      console.error('Error adding part:', error);
      toast({
        title: "Error adding part",
        description: "Failed to add the part. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="inventory" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            From Inventory
          </TabsTrigger>
          <TabsTrigger value="manual" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Manual Entry
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Select from Inventory
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Search and select parts from your inventory to add to this work order.
              </p>
              
              {selectedInventoryItems.length > 0 && (
                <div className="space-y-4 mb-4">
                  <h4 className="font-medium">Selected Items ({selectedInventoryItems.length})</h4>
                  {selectedInventoryItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">{item.sku}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleInventoryItemQuantityChange(item.id, parseInt(e.target.value) || 1)}
                          className="w-20"
                          min="1"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleInventoryItemRemove(item.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={addInventoryItemsAsWorkOrderParts}
                  disabled={selectedInventoryItems.length === 0 || isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? 'Adding...' : `Add ${selectedInventoryItems.length} Item(s)`}
                </Button>
                <Button variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manual" className="space-y-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Part Name *</Label>
                    <Input
                      id="name"
                      {...register('name', { required: 'Part name is required' })}
                      placeholder="Enter part name"
                    />
                    {errors.name && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="part_number">Part Number</Label>
                    <Input
                      id="part_number"
                      {...register('part_number')}
                      placeholder="Enter part number"
                    />
                  </div>

                  <div className="space-y-2">
                    <CategorySelector
                      value={watch('category')}
                      onValueChange={(value) => setValue('category', value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="partType">Part Type</Label>
                    <Select
                      value={watch('partType')}
                      onValueChange={(value) => setValue('partType', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select part type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="part">Part</SelectItem>
                        <SelectItem value="fluid">Fluid</SelectItem>
                        <SelectItem value="consumable">Consumable</SelectItem>
                        <SelectItem value="core">Core</SelectItem>
                        <SelectItem value="kit">Kit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    {...register('description')}
                    placeholder="Enter part description"
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Quantity and Pricing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Quantity & Pricing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity *</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      {...register('quantity', { 
                        required: 'Quantity is required',
                        min: { value: 1, message: 'Quantity must be at least 1' }
                      })}
                    />
                    {errors.quantity && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.quantity.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="supplierCost">Supplier Cost</Label>
                    <Input
                      id="supplierCost"
                      type="number"
                      step="0.01"
                      min="0"
                      {...register('supplierCost', { valueAsNumber: true })}
                      placeholder="0.00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="markupPercentage">Markup %</Label>
                    <Input
                      id="markupPercentage"
                      type="number"
                      step="0.1"
                      min="0"
                      {...register('markupPercentage', { valueAsNumber: true })}
                      placeholder="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="retailPrice">Retail Price</Label>
                    <Input
                      id="retailPrice"
                      type="number"
                      step="0.01"
                      min="0"
                      {...register('retailPrice', { valueAsNumber: true })}
                      placeholder="0.00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customerPrice">Customer Price *</Label>
                    <Input
                      id="customerPrice"
                      type="number"
                      step="0.01"
                      min="0"
                      {...register('customerPrice', { 
                        required: 'Customer price is required',
                        valueAsNumber: true 
                      })}
                      placeholder="0.00"
                    />
                    {errors.customerPrice && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.customerPrice.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="unit_price">Unit Price</Label>
                    <Input
                      id="unit_price"
                      type="number"
                      step="0.01"
                      min="0"
                      {...register('unit_price', { valueAsNumber: true })}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isTaxable"
                    checked={watch('isTaxable')}
                    onCheckedChange={(checked) => setValue('isTaxable', checked)}
                  />
                  <Label htmlFor="isTaxable">Taxable item</Label>
                </div>
              </CardContent>
            </Card>

            {/* Supplier Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Supplier Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SupplierSelector
                    value={watch('supplierName')}
                    onValueChange={(value) => setValue('supplierName', value)}
                  />

                  <div className="space-y-2">
                    <Label htmlFor="invoiceNumber">Invoice Number</Label>
                    <Input
                      id="invoiceNumber"
                      {...register('invoiceNumber')}
                      placeholder="Enter invoice number"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="poLine">PO Line</Label>
                    <Input
                      id="poLine"
                      {...register('poLine')}
                      placeholder="Enter PO line"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Core Charges */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Core Charges
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="coreChargeApplied"
                    checked={watch('coreChargeApplied')}
                    onCheckedChange={(checked) => setValue('coreChargeApplied', checked)}
                  />
                  <Label htmlFor="coreChargeApplied">Apply core charge</Label>
                </div>

                {watch('coreChargeApplied') && (
                  <div className="space-y-2">
                    <Label htmlFor="coreChargeAmount">Core Charge Amount</Label>
                    <Input
                      id="coreChargeAmount"
                      type="number"
                      step="0.01"
                      min="0"
                      {...register('coreChargeAmount', { valueAsNumber: true })}
                      placeholder="0.00"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Warranty Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Warranty Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="warrantyDuration">Warranty Duration</Label>
                  <Select
                    value={watch('warrantyDuration')}
                    onValueChange={(value) => setValue('warrantyDuration', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select warranty duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30_days">30 Days</SelectItem>
                      <SelectItem value="90_days">90 Days</SelectItem>
                      <SelectItem value="6_months">6 Months</SelectItem>
                      <SelectItem value="1_year">1 Year</SelectItem>
                      <SelectItem value="2_years">2 Years</SelectItem>
                      <SelectItem value="3_years">3 Years</SelectItem>
                      <SelectItem value="lifetime">Lifetime</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="notes">Customer Notes</Label>
                  <Textarea
                    id="notes"
                    {...register('notes')}
                    placeholder="Notes visible to customer"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notesInternal">Internal Notes</Label>
                  <Textarea
                    id="notesInternal"
                    {...register('notesInternal')}
                    placeholder="Internal notes (not visible to customer)"
                    rows={2}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isStockItem"
                    checked={watch('isStockItem')}
                    onCheckedChange={(checked) => setValue('isStockItem', checked)}
                  />
                  <Label htmlFor="isStockItem">Stock item</Label>
                </div>
              </CardContent>
            </Card>

            <Separator />

            {/* Form Actions */}
            <div className="flex gap-2">
              <Button 
                type="submit" 
                disabled={isSubmitting || isLoading}
                className="flex-1"
              >
                {isSubmitting ? 'Adding Part...' : 'Add Part'}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}
