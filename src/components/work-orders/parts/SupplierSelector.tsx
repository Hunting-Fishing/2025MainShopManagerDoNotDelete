
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Search } from 'lucide-react';
import { getInventorySuppliers, addInventorySupplier } from '@/services/inventory/supplierService';
import { toast } from 'sonner';

interface SupplierSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
}

export function SupplierSelector({ value, onValueChange, placeholder = "Select supplier..." }: SupplierSelectorProps) {
  const [suppliers, setSuppliers] = useState<string[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newSupplierName, setNewSupplierName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    try {
      const supplierList = await getInventorySuppliers();
      setSuppliers(supplierList);
    } catch (error) {
      console.error('Error loading suppliers:', error);
      toast.error('Failed to load suppliers');
    }
  };

  const handleAddSupplier = async () => {
    if (!newSupplierName.trim()) {
      toast.error('Please enter a supplier name');
      return;
    }

    try {
      setIsLoading(true);
      await addInventorySupplier(newSupplierName.trim());
      await loadSuppliers();
      onValueChange(newSupplierName.trim());
      setNewSupplierName('');
      setShowAddDialog(false);
      toast.success('Supplier added successfully');
    } catch (error) {
      console.error('Error adding supplier:', error);
      toast.error('Failed to add supplier');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchChange = (searchTerm: string) => {
    setSearchValue(searchTerm);
    onValueChange(searchTerm);
  };

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.toLowerCase().includes(searchValue.toLowerCase())
  );

  return (
    <div className="space-y-2">
      <Label>Supplier</Label>
      <div className="flex gap-2">
        <div className="flex-1">
          <Select value={value} onValueChange={onValueChange}>
            <SelectTrigger>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {filteredSuppliers.length > 0 ? (
                filteredSuppliers.map((supplier) => (
                  <SelectItem key={supplier} value={supplier}>
                    {supplier}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-suppliers" disabled>
                  No suppliers found
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search or type supplier name..."
              value={searchValue}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Supplier</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="supplier-name">Supplier Name</Label>
                <Input
                  id="supplier-name"
                  value={newSupplierName}
                  onChange={(e) => setNewSupplierName(e.target.value)}
                  placeholder="Enter supplier name..."
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddSupplier} disabled={isLoading}>
                  {isLoading ? 'Adding...' : 'Add Supplier'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
