
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { WorkOrderPartFormValues, WORK_ORDER_PART_STATUSES } from '@/types/workOrderPart';
import { CategorySelector } from './CategorySelector';
import { SupplierSelector } from './SupplierSelector';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { 
  Package, 
  Calculator, 
  Truck, 
  Shield, 
  FileText, 
  Search,
  Star,
  DollarSign,
  Calendar,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface ComprehensivePartEntryFormProps {
  onPartAdd: (part: WorkOrderPartFormValues) => void;
  onCancel: () => void;
  isLoading?: boolean;
  workOrderId?: string;
  jobLineId?: string;
}

interface InventoryItem {
  id: string;
  name: string;
  part_number: string;
  description?: string;
  category?: string;
  unit_price: number;
  supplier_name?: string;
  quantity_on_hand: number;
  retail_price?: number;
  wholesale_price?: number;
}

export function ComprehensivePartEntryForm({
  onPartAdd,
  onCancel,
  isLoading = false,
  workOrderId,
  jobLineId
}: ComprehensivePartEntryFormProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'inventory' | 'manual'>('inventory');
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]);
  const [selectedInventoryItem, setSelectedInventoryItem] = useState<InventoryItem | null>(null);
  const [isLoadingInventory, setIsLoadingInventory] = useState(false);

  // Form state
  const [formData, setFormData] = useState<WorkOrderPartFormValues>({
    name: '',
    part_number: '',
    description: '',
    quantity: 1,
    unit_price: 0,
    status: 'pending',
    notes: '',
    category: '',
    customerPrice: 0,
    supplierCost: 0,
    retailPrice: 0,
    markupPercentage: 0,
    isTaxable: true,
    coreChargeAmount: 0,
    coreChargeApplied: false,
    warrantyDuration: '',
    supplierName: '',
    isStockItem: false,
    notesInternal: '',
    partType: 'parts'
  });

  // Load inventory items
  useEffect(() => {
    loadInventoryItems();
  }, []);

  // Filter inventory items based on search
  useEffect(() => {
    if (searchTerm) {
      const filtered = inventoryItems.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.part_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredItems(filtered);
    } else {
      setFilteredItems(inventoryItems);
    }
  }, [searchTerm, inventoryItems]);

  // Calculate prices when values change
  useEffect(() => {
    calculatePrices();
  }, [formData.supplierCost, formData.markupPercentage, formData.quantity]);

  const loadInventoryItems = async () => {
    setIsLoadingInventory(true);
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setInventoryItems(data || []);
    } catch (error) {
      console.error('Error loading inventory:', error);
      toast({
        title: "Warning",
        description: "Could not load inventory items",
        variant: "destructive"
      });
    } finally {
      setIsLoadingInventory(false);
    }
  };

  const calculatePrices = () => {
    const supplierCost = formData.supplierCost || 0;
    const markupPercent = formData.markupPercentage || 0;
    
    if (supplierCost > 0 && markupPercent > 0) {
      const retailPrice = supplierCost * (1 + markupPercent / 100);
      const totalPrice = retailPrice * formData.quantity;
      
      setFormData(prev => ({
        ...prev,
        retailPrice: Number(retailPrice.toFixed(2)),
        unit_price: Number(retailPrice.toFixed(2)),
        customerPrice: Number(totalPrice.toFixed(2))
      }));
    }
  };

  const handleInventoryItemSelect = (item: InventoryItem) => {
    setSelectedInventoryItem(item);
    setFormData(prev => ({
      ...prev,
      name: item.name,
      part_number: item.part_number,
      description: item.description || '',
      unit_price: item.unit_price || item.retail_price || 0,
      category: item.category || '',
      supplierName: item.supplier_name || '',
      retailPrice: item.retail_price || 0,
      supplierCost: item.wholesale_price || 0,
      isStockItem: true,
      inventoryItemId: item.id
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.part_number || formData.quantity <= 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      // Add to database
      const { error } = await supabase
        .from('work_order_parts')
        .insert({
          work_order_id: workOrderId,
          job_line_id: jobLineId,
          name: formData.name,
          part_number: formData.part_number,
          description: formData.description,
          quantity: formData.quantity,
          unit_price: formData.unit_price,
          total_price: formData.unit_price * formData.quantity,
          status: formData.status,
          notes: formData.notes,
          category: formData.category,
          supplier_name: formData.supplierName,
          supplier_cost: formData.supplierCost,
          customer_price: formData.customerPrice,
          retail_price: formData.retailPrice,
          markup_percentage: formData.markupPercentage,
          is_taxable: formData.isTaxable,
          core_charge_amount: formData.coreChargeAmount,
          core_charge_applied: formData.coreChargeApplied,
          warranty_duration: formData.warrantyDuration,
          is_stock_item: formData.isStockItem,
          notes_internal: formData.notesInternal,
          inventory_item_id: formData.inventoryItemId,
          part_type: formData.partType
        });

      if (error) throw error;

      onPartAdd(formData);
      toast({
        title: "Success",
        description: "Part added successfully"
      });
    } catch (error) {
      console.error('Error adding part:', error);
      toast({
        title: "Error",
        description: "Failed to add part",
        variant: "destructive"
      });
    }
  };

  const updateFormData = (field: keyof WorkOrderPartFormValues, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gradient-to-br from-slate-50 to-gray-100 min-h-screen">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-xl">
          <div className="flex items-center gap-3">
            <Package className="h-8 w-8" />
            <div>
              <h2 className="text-2xl font-bold">Add Part to Work Order</h2>
              <p className="text-blue-100 mt-1">Choose from inventory or add manually</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'inventory' | 'manual')} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-100 h-12">
              <TabsTrigger 
                value="inventory" 
                className="flex items-center gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white text-base font-medium"
              >
                <Search className="h-4 w-4" />
                From Inventory
              </TabsTrigger>
              <TabsTrigger 
                value="manual" 
                className="flex items-center gap-2 data-[state=active]:bg-green-500 data-[state=active]:text-white text-base font-medium"
              >
                <FileText className="h-4 w-4" />
                Manual Entry
              </TabsTrigger>
            </TabsList>

            {/* Inventory Tab */}
            <TabsContent value="inventory" className="space-y-6 mt-6">
              <Card className="border-blue-200 shadow-md">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
                  <CardTitle className="flex items-center gap-2 text-blue-800">
                    <Search className="h-5 w-5" />
                    Search Inventory
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search by name, part number, or category..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  
                  {isLoadingInventory ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-2 text-gray-600">Loading inventory...</span>
                    </div>
                  ) : (
                    <div className="grid gap-3 max-h-96 overflow-y-auto">
                      {filteredItems.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <Package className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                          <p>No inventory items found</p>
                        </div>
                      ) : (
                        filteredItems.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => handleInventoryItemSelect(item)}
                            className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                              selectedInventoryItem?.id === item.id
                                ? 'border-blue-500 bg-blue-50 shadow-md'
                                : 'border-gray-200 bg-white hover:border-blue-300'
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className="font-semibold text-gray-900">{item.name}</h4>
                                  <Badge variant="secondary" className="text-xs">
                                    {item.part_number}
                                  </Badge>
                                </div>
                                {item.description && (
                                  <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                                )}
                                {item.category && (
                                  <Badge variant="outline" className="text-xs">
                                    {item.category}
                                  </Badge>
                                )}
                              </div>
                              <div className="text-right">
                                <div className="flex items-center gap-1 text-green-600 font-semibold">
                                  <DollarSign className="h-4 w-4" />
                                  {item.unit_price || item.retail_price || 0}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  Stock: {item.quantity_on_hand}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Manual Entry Tab */}
            <TabsContent value="manual" className="mt-6">
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full">
                  <FileText className="h-4 w-4" />
                  <span className="font-medium">Manual Part Entry</span>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Form Section - Shows when inventory item selected or in manual mode */}
          {(selectedInventoryItem || activeTab === 'manual') && (
            <form onSubmit={handleSubmit} className="space-y-6 mt-8">
              <Separator />
              
              {/* Basic Information */}
              <Card className="border-green-200 shadow-md">
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-100 border-b border-green-200">
                  <CardTitle className="flex items-center gap-2 text-green-800">
                    <Package className="h-5 w-5" />
                    Basic Information
                    <Badge variant="secondary" className="ml-auto">Required</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="flex items-center gap-1 text-gray-700 font-medium">
                        Part Name <Star className="h-3 w-3 text-red-500" />
                      </Label>
                      <Input
                        value={formData.name}
                        onChange={(e) => updateFormData('name', e.target.value)}
                        placeholder="Enter part name"
                        required
                        className="mt-1 border-gray-300 focus:border-green-500 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <Label className="flex items-center gap-1 text-gray-700 font-medium">
                        Part Number <Star className="h-3 w-3 text-red-500" />
                      </Label>
                      <Input
                        value={formData.part_number}
                        onChange={(e) => updateFormData('part_number', e.target.value)}
                        placeholder="Enter part number"
                        required
                        className="mt-1 border-gray-300 focus:border-green-500 focus:ring-green-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-gray-700 font-medium">Description</Label>
                    <Textarea
                      value={formData.description || ''}
                      onChange={(e) => updateFormData('description', e.target.value)}
                      placeholder="Part description..."
                      className="mt-1 border-gray-300 focus:border-green-500 focus:ring-green-500"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <CategorySelector
                      value={formData.category}
                      onValueChange={(value) => updateFormData('category', value)}
                    />
                    <div>
                      <Label className="text-gray-700 font-medium">Status</Label>
                      <Select value={formData.status} onValueChange={(value) => updateFormData('status', value)}>
                        <SelectTrigger className="mt-1 border-gray-300 focus:border-green-500">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {WORK_ORDER_PART_STATUSES.map((status) => (
                            <SelectItem key={status} value={status}>
                              <div className="flex items-center gap-2">
                                {status === 'pending' && <AlertCircle className="h-4 w-4 text-yellow-500" />}
                                {status === 'ordered' && <Calendar className="h-4 w-4 text-blue-500" />}
                                {status === 'received' && <CheckCircle className="h-4 w-4 text-green-500" />}
                                {status === 'installed' && <CheckCircle className="h-4 w-4 text-emerald-500" />}
                                <span className="capitalize">{status.replace('-', ' ')}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Pricing Information */}
              <Card className="border-purple-200 shadow-md">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-100 border-b border-purple-200">
                  <CardTitle className="flex items-center gap-2 text-purple-800">
                    <Calculator className="h-5 w-5" />
                    Pricing & Calculations
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="flex items-center gap-1 text-gray-700 font-medium">
                        Quantity <Star className="h-3 w-3 text-red-500" />
                      </Label>
                      <Input
                        type="number"
                        value={formData.quantity}
                        onChange={(e) => updateFormData('quantity', Number(e.target.value))}
                        min="1"
                        step="1"
                        required
                        className="mt-1 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-700 font-medium">Supplier Cost</Label>
                      <div className="relative mt-1">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          type="number"
                          value={formData.supplierCost || ''}
                          onChange={(e) => updateFormData('supplierCost', Number(e.target.value))}
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          className="pl-10 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-gray-700 font-medium">Markup %</Label>
                      <Input
                        type="number"
                        value={formData.markupPercentage || ''}
                        onChange={(e) => updateFormData('markupPercentage', Number(e.target.value))}
                        min="0"
                        step="0.1"
                        placeholder="0"
                        className="mt-1 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-700 font-medium">Unit Price</Label>
                      <div className="relative mt-1">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          type="number"
                          value={formData.unit_price}
                          onChange={(e) => updateFormData('unit_price', Number(e.target.value))}
                          min="0"
                          step="0.01"
                          required
                          className="pl-10 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-gray-700 font-medium">Total Price</Label>
                      <div className="mt-1 p-3 bg-purple-50 border border-purple-200 rounded-md">
                        <div className="flex items-center gap-2 text-purple-700 font-semibold">
                          <DollarSign className="h-4 w-4" />
                          {(formData.unit_price * formData.quantity).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Switch
                      checked={formData.isTaxable}
                      onCheckedChange={(checked) => updateFormData('isTaxable', checked)}
                    />
                    <Label className="text-gray-700 font-medium">Taxable Item</Label>
                  </div>
                </CardContent>
              </Card>

              {/* Supplier Information */}
              <Card className="border-orange-200 shadow-md">
                <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-100 border-b border-orange-200">
                  <CardTitle className="flex items-center gap-2 text-orange-800">
                    <Truck className="h-5 w-5" />
                    Supplier Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <SupplierSelector
                    value={formData.supplierName}
                    onValueChange={(value) => updateFormData('supplierName', value)}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-700 font-medium">Core Charge</Label>
                      <div className="relative mt-1">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          type="number"
                          value={formData.coreChargeAmount || ''}
                          onChange={(e) => updateFormData('coreChargeAmount', Number(e.target.value))}
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          className="pl-10 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Switch
                        checked={formData.coreChargeApplied}
                        onCheckedChange={(checked) => updateFormData('coreChargeApplied', checked)}
                      />
                      <Label className="text-gray-700 font-medium">Apply Core Charge</Label>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Warranty & Notes */}
              <Card className="border-indigo-200 shadow-md">
                <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-100 border-b border-indigo-200">
                  <CardTitle className="flex items-center gap-2 text-indigo-800">
                    <Shield className="h-5 w-5" />
                    Warranty & Notes
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div>
                    <Label className="text-gray-700 font-medium">Warranty Duration</Label>
                    <Input
                      value={formData.warrantyDuration || ''}
                      onChange={(e) => updateFormData('warrantyDuration', e.target.value)}
                      placeholder="e.g., 12 months, 36,000 miles"
                      className="mt-1 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-gray-700 font-medium">Customer Notes</Label>
                    <Textarea
                      value={formData.notes || ''}
                      onChange={(e) => updateFormData('notes', e.target.value)}
                      placeholder="Notes visible to customer..."
                      className="mt-1 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <Label className="text-gray-700 font-medium">Internal Notes</Label>
                    <Textarea
                      value={formData.notesInternal || ''}
                      onChange={(e) => updateFormData('notesInternal', e.target.value)}
                      placeholder="Internal notes (not visible to customer)..."
                      className="mt-1 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  className="px-6 py-2 border-gray-300 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="px-8 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium shadow-lg"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></div>
                      Adding Part...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Add Part
                    </div>
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
