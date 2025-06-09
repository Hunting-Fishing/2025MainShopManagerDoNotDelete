
import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';
import { getInventorySuppliers, addInventorySupplier } from '@/services/inventory/supplierService';
import { toast } from 'sonner';

interface SupplierSelectorProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SupplierSelector({ value, onChange, placeholder = "Select supplier..." }: SupplierSelectorProps) {
  const [suppliers, setSuppliers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddNew, setShowAddNew] = useState(false);
  const [newSupplier, setNewSupplier] = useState('');
  const [adding, setAdding] = useState(false);

  const fetchSuppliers = async () => {
    try {
      console.log('SupplierSelector: Fetching suppliers...');
      setLoading(true);
      const supplierList = await getInventorySuppliers();
      console.log('SupplierSelector: Received suppliers:', supplierList);
      setSuppliers(supplierList);
    } catch (error) {
      console.error('SupplierSelector: Error fetching suppliers:', error);
      toast.error('Failed to load suppliers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleAddSupplier = async () => {
    if (!newSupplier.trim()) {
      toast.error('Please enter a supplier name');
      return;
    }

    try {
      setAdding(true);
      await addInventorySupplier(newSupplier.trim());
      
      // Refresh suppliers list
      await fetchSuppliers();
      
      // Select the newly added supplier
      onChange(newSupplier.trim());
      
      // Reset form
      setNewSupplier('');
      setShowAddNew(false);
    } catch (error) {
      console.error('Error adding supplier:', error);
      toast.error('Failed to add supplier');
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder="Loading suppliers..." />
        </SelectTrigger>
      </Select>
    );
  }

  if (showAddNew) {
    return (
      <div className="flex gap-2">
        <Input
          value={newSupplier}
          onChange={(e) => setNewSupplier(e.target.value)}
          placeholder="Enter supplier name"
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleAddSupplier();
            }
          }}
        />
        <Button 
          onClick={handleAddSupplier} 
          disabled={adding || !newSupplier.trim()}
          size="sm"
        >
          {adding ? 'Adding...' : 'Add'}
        </Button>
        <Button 
          variant="outline" 
          onClick={() => {
            setShowAddNew(false);
            setNewSupplier('');
          }}
          size="sm"
        >
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="flex-1">
          <SelectValue placeholder={suppliers.length > 0 ? placeholder : "No suppliers available"} />
        </SelectTrigger>
        <SelectContent>
          {suppliers.length > 0 ? (
            suppliers.map((supplier) => (
              <SelectItem key={supplier} value={supplier}>
                {supplier}
              </SelectItem>
            ))
          ) : (
            <div className="p-2 text-center text-slate-500 text-sm">
              No suppliers found. Click + to add one.
            </div>
          )}
        </SelectContent>
      </Select>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowAddNew(true)}
        className="shrink-0"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}
