import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InventoryItemExtended } from "@/types/inventory";
export interface InventoryFormProps {
  initialData?: Partial<InventoryItemExtended>;
  onSubmit: (formData: Omit<InventoryItemExtended, "id">) => Promise<void> | void;
  isLoading?: boolean;
  onCancel: () => void;
}
export function InventoryForm({
  initialData,
  onSubmit,
  isLoading = false,
  onCancel
}: InventoryFormProps) {
  const [formData, setFormData] = useState<Partial<InventoryItemExtended>>(initialData || {
    name: '',
    sku: '',
    description: '',
    category: '',
    supplier: '',
    location: '',
    quantity: 0,
    reorder_point: 5,
    unit_price: 0,
    status: 'In Stock'
  });
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const {
      name,
      value
    } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {
      name,
      value
    } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: Number(value)
    }));
  };
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData as Omit<InventoryItemExtended, "id">);
  };
  return <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-sm border">
      <h2 className="text-2xl font-bold">{initialData ? 'Edit' : 'Add'} Inventory Item</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Item Name *
            </label>
            <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
          </div>
          
          <div>
            <label htmlFor="sku" className="block text-sm font-medium text-gray-700 mb-1">
              SKU *
            </label>
            <Input id="sku" name="sku" value={formData.sku} onChange={handleChange} required />
          </div>
          
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <Select value={formData.category || ''} onValueChange={value => handleSelectChange('category', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Parts">Parts</SelectItem>
                <SelectItem value="Fluids">Fluids</SelectItem>
                <SelectItem value="Tools">Tools</SelectItem>
                <SelectItem value="Accessories" className="bg-cyan-200">Accessories</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label htmlFor="supplier" className="block text-sm font-medium text-gray-700 mb-1">
              Supplier
            </label>
            <Input id="supplier" name="supplier" value={formData.supplier || ''} onChange={handleChange} />
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
              Quantity *
            </label>
            <Input id="quantity" name="quantity" type="number" value={formData.quantity} onChange={handleNumberChange} required />
          </div>
          
          <div>
            <label htmlFor="reorder_point" className="block text-sm font-medium text-gray-700 mb-1">
              Reorder Point
            </label>
            <Input id="reorder_point" name="reorder_point" type="number" value={formData.reorder_point} onChange={handleNumberChange} />
          </div>
          
          <div>
            <label htmlFor="unit_price" className="block text-sm font-medium text-gray-700 mb-1">
              Unit Price *
            </label>
            <Input id="unit_price" name="unit_price" type="number" step="0.01" value={formData.unit_price} onChange={handleNumberChange} required />
          </div>
          
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <Input id="location" name="location" value={formData.location || ''} onChange={handleChange} />
          </div>
        </div>
      </div>
      
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <Textarea id="description" name="description" value={formData.description || ''} onChange={handleChange} rows={3} />
      </div>
      
      <div className="flex justify-end space-x-4 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : (initialData ? "Update" : "Add") + " Item"}
        </Button>
      </div>
    </form>;
}