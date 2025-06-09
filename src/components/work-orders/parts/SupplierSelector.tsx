
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Search } from 'lucide-react';
import { getInventorySuppliers, addInventorySupplier } from '@/services/inventory/supplierService';
import { toast } from 'sonner';

interface SupplierSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
}

export function SupplierSelector({ value, onValueChange, placeholder = "Select supplier" }: SupplierSelectorProps) {
  const [suppliers, setSuppliers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newSupplierName, setNewSupplierName] = useState('');

  // Load suppliers from settings
  const loadSuppliers = async () => {
    try {
      setLoading(true);
      const suppliersList = await getInventorySuppliers();
      setSuppliers(suppliersList);
    } catch (error) {
      console.error('Failed to load suppliers:', error);
      toast.error('Failed to load suppliers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  // Filter suppliers based on search query
  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle adding new supplier
  const handleAddSupplier = async () => {
    if (!newSupplierName.trim()) {
      toast.error('Please enter a supplier name');
      return;
    }

    try {
      await addInventorySupplier(newSupplierName.trim());
      await loadSuppliers(); // Reload suppliers list
      onValueChange(newSupplierName.trim()); // Select the newly added supplier
      setNewSupplierName('');
      setIsAddDialogOpen(false);
      toast.success(`Supplier "${newSupplierName.trim()}" added successfully`);
    } catch (error) {
      console.error('Failed to add supplier:', error);
      toast.error('Failed to add supplier');
    }
  };

  // Handle selection from dropdown
  const handleSupplierSelect = (selectedSupplier: string) => {
    onValueChange(selectedSupplier);
    setSearchQuery(''); // Clear search when selecting
  };

  // Handle typing in search - allow manual entry
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    onValueChange(query); // Allow manual entry
  };

  return (
    <div className="space-y-2">
      <Label>Supplier</Label>
      <div className="flex gap-2">
        <div className="flex-1">
          <Select value={value} onValueChange={handleSupplierSelect}>
            <SelectTrigger>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {loading ? (
                <SelectItem value="" disabled>Loading suppliers...</SelectItem>
              ) : filteredSuppliers.length > 0 ? (
                filteredSuppliers.map((supplier) => (
                  <SelectItem key={supplier} value={supplier}>
                    {supplier}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="" disabled>No suppliers found</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex gap-1">
          {/* Search Input */}
          <div className="relative">
            <Input
              type="text"
              placeholder="Search or type supplier..."
              value={searchQuery || value}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-48 pr-8"
            />
            <Search className="h-4 w-4 absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          </div>

          {/* Add Supplier Button */}
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
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
                    placeholder="Enter supplier name"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleAddSupplier();
                      }
                    }}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddSupplier}>
                    Add Supplier
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
