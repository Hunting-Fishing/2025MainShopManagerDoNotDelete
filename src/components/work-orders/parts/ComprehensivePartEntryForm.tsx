
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { WorkOrderJobLine } from '@/types/jobLine';
import { createWorkOrderPart } from '@/services/workOrder/workOrderPartsService';
import { mapPartFormToDatabase } from '@/utils/databaseMappers';
import { useToast } from '@/hooks/use-toast';
import { WORK_ORDER_PART_STATUSES } from '@/types/workOrderPart';

interface ComprehensivePartEntryFormProps {
  workOrderId?: string;
  jobLineId?: string;
  jobLines?: WorkOrderJobLine[];
  onPartAdd?: (part: any) => void;
  onCancel?: () => void;
}

export function ComprehensivePartEntryForm({
  workOrderId,
  jobLineId,
  jobLines = [],
  onPartAdd,
  onCancel
}: ComprehensivePartEntryFormProps) {
  const { toast } = useToast();
  
  // Basic part information
  const [partName, setPartName] = useState('');
  const [partNumber, setPartNumber] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedJobLineId, setSelectedJobLineId] = useState(jobLineId || '');
  
  // Pricing information
  const [customerPrice, setCustomerPrice] = useState(0);
  const [supplierCost, setSupplierCost] = useState(0);
  const [retailPrice, setRetailPrice] = useState(0);
  const [markupPercentage, setMarkupPercentage] = useState(0);
  
  // Additional information
  const [supplierName, setSupplierName] = useState('');
  const [partType, setPartType] = useState('OEM');
  const [isTaxable, setIsTaxable] = useState(true);
  const [coreChargeAmount, setCoreChargeAmount] = useState(0);
  const [coreChargeApplied, setCoreChargeApplied] = useState(false);
  const [warrantyDuration, setWarrantyDuration] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [poLine, setPoLine] = useState('');
  const [isStockItem, setIsStockItem] = useState(false);
  const [status, setStatus] = useState('pending');
  const [notes, setNotes] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate markup when supplier cost or customer price changes
  React.useEffect(() => {
    if (supplierCost > 0 && customerPrice > 0) {
      const markup = ((customerPrice - supplierCost) / supplierCost) * 100;
      setMarkupPercentage(Math.round(markup * 100) / 100);
    }
  }, [supplierCost, customerPrice]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!workOrderId) {
      toast({
        title: "Error",
        description: "Work order ID is required",
        variant: "destructive",
      });
      return;
    }

    if (!partName.trim() || !partNumber.trim()) {
      toast({
        title: "Error",
        description: "Part name and part number are required",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = {
        part_name: partName,
        part_number: partNumber,
        description,
        category,
        quantity,
        customer_price: customerPrice,
        supplier_cost: supplierCost,
        retail_price: retailPrice,
        supplier_name: supplierName,
        part_type: partType,
        markup_percentage: markupPercentage,
        is_taxable: isTaxable,
        core_charge_amount: coreChargeAmount,
        core_charge_applied: coreChargeApplied,
        warranty_duration: warrantyDuration,
        invoice_number: invoiceNumber,
        po_line: poLine,
        is_stock_item: isStockItem,
        status,
        notes
      };

      // Map form data to database schema
      const dbData = mapPartFormToDatabase(formData, workOrderId, selectedJobLineId);
      
      console.log('Creating part with data:', dbData);
      
      // Save directly to database
      const newPart = await createWorkOrderPart(dbData);
      
      if (newPart) {
        toast({
          title: "Success",
          description: "Part added successfully",
          variant: "default",
        });
        
        onPartAdd?.(newPart);
      } else {
        throw new Error('Failed to create part');
      }
    } catch (error) {
      console.error('Error creating part:', error);
      toast({
        title: "Error",
        description: "Failed to add part. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="partName">Part Name *</Label>
              <Input
                id="partName"
                value={partName}
                onChange={(e) => setPartName(e.target.value)}
                placeholder="Enter part name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="partNumber">Part Number *</Label>
              <Input
                id="partNumber"
                value={partNumber}
                onChange={(e) => setPartNumber(e.target.value)}
                placeholder="Enter part number"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Enter category"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              />
            </div>
          </div>

          {jobLines.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="jobLine">Assign to Job Line (Optional)</Label>
              <Select value={selectedJobLineId} onValueChange={setSelectedJobLineId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a job line or leave unassigned" />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200 shadow-lg z-50">
                  <SelectItem value="">Unassigned</SelectItem>
                  {jobLines.map((jobLine) => (
                    <SelectItem key={jobLine.id} value={jobLine.id}>
                      {jobLine.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter part description"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Pricing Information */}
      <Card>
        <CardHeader>
          <CardTitle>Pricing Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customerPrice">Customer Price</Label>
              <Input
                id="customerPrice"
                type="number"
                step="0.01"
                min="0"
                value={customerPrice}
                onChange={(e) => setCustomerPrice(parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="supplierCost">Supplier Cost</Label>
              <Input
                id="supplierCost"
                type="number"
                step="0.01"
                min="0"
                value={supplierCost}
                onChange={(e) => setSupplierCost(parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="retailPrice">Retail Price</Label>
              <Input
                id="retailPrice"
                type="number"
                step="0.01"
                min="0"
                value={retailPrice}
                onChange={(e) => setRetailPrice(parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>
          </div>
          
          {markupPercentage > 0 && (
            <div className="text-sm text-muted-foreground">
              Markup: {markupPercentage}%
            </div>
          )}
        </CardContent>
      </Card>

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="supplierName">Supplier Name</Label>
              <Input
                id="supplierName"
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
                placeholder="Enter supplier name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="partType">Part Type</Label>
              <Select value={partType} onValueChange={setPartType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200 shadow-lg z-50">
                  <SelectItem value="OEM">OEM</SelectItem>
                  <SelectItem value="Aftermarket">Aftermarket</SelectItem>
                  <SelectItem value="Remanufactured">Remanufactured</SelectItem>
                  <SelectItem value="Used">Used</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="warrantyDuration">Warranty Duration</Label>
              <Input
                id="warrantyDuration"
                value={warrantyDuration}
                onChange={(e) => setWarrantyDuration(e.target.value)}
                placeholder="e.g., 12 months, 1 year"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200 shadow-lg z-50">
                  {WORK_ORDER_PART_STATUSES.map((statusOption) => (
                    <SelectItem key={statusOption} value={statusOption}>
                      {statusOption.charAt(0).toUpperCase() + statusOption.slice(1).replace('-', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="invoiceNumber">Invoice Number</Label>
              <Input
                id="invoiceNumber"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                placeholder="Enter invoice number"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="poLine">PO Line</Label>
              <Input
                id="poLine"
                value={poLine}
                onChange={(e) => setPoLine(e.target.value)}
                placeholder="Enter PO line"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="isTaxable"
                checked={isTaxable}
                onCheckedChange={setIsTaxable}
              />
              <Label htmlFor="isTaxable">Taxable</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="isStockItem"
                checked={isStockItem}
                onCheckedChange={setIsStockItem}
              />
              <Label htmlFor="isStockItem">Stock Item</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="coreChargeApplied"
                checked={coreChargeApplied}
                onCheckedChange={setCoreChargeApplied}
              />
              <Label htmlFor="coreChargeApplied">Core Charge Applied</Label>
            </div>
          </div>
          
          {coreChargeApplied && (
            <div className="space-y-2">
              <Label htmlFor="coreChargeAmount">Core Charge Amount</Label>
              <Input
                id="coreChargeAmount"
                type="number"
                step="0.01"
                min="0"
                value={coreChargeAmount}
                onChange={(e) => setCoreChargeAmount(parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes about this part"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Form Actions */}
      <div className="flex justify-end space-x-2">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Adding Part...' : 'Add Part'}
        </Button>
      </div>
    </form>
  );
}
