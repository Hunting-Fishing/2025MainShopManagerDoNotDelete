
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  getInventorySuppliers, 
  addInventorySupplier, 
  deleteInventorySupplier 
} from "@/services/inventory/supplierService";
import { toast } from "@/hooks/use-toast";

export function SuppliersManager() {
  const [suppliers, setSuppliers] = useState<string[]>([]);
  const [newSupplier, setNewSupplier] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    try {
      const loadedSuppliers = await getInventorySuppliers();
      setSuppliers(loadedSuppliers);
    } catch (error) {
      console.error("Error loading inventory suppliers:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load inventory suppliers"
      });
    }
  };

  const handleAddSupplier = async () => {
    if (!newSupplier.trim()) return;
    
    // Check for duplicates
    if (suppliers.includes(newSupplier.trim())) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "This supplier already exists"
      });
      return;
    }

    setIsLoading(true);
    try {
      await addInventorySupplier(newSupplier.trim());
      setSuppliers([...suppliers, newSupplier.trim()].sort());
      setNewSupplier("");
      toast({
        variant: "success",
        title: "Success",
        description: "Supplier added successfully"
      });
    } catch (error) {
      console.error("Error adding supplier:", error);
      toast({
        variant: "destructive", 
        title: "Error",
        description: "Failed to add supplier"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSupplier = async (supplier: string) => {
    if (confirm(`Are you sure you want to delete "${supplier}"?`)) {
      setIsLoading(true);
      try {
        await deleteInventorySupplier(supplier);
        setSuppliers(suppliers.filter(s => s !== supplier));
        toast({
          variant: "success",
          title: "Success",
          description: "Supplier deleted successfully"
        });
      } catch (error) {
        console.error("Error deleting supplier:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to delete supplier"
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventory Suppliers</CardTitle>
        <CardDescription>
          Manage the suppliers for your inventory items
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-6">
          <Input
            placeholder="New supplier name"
            value={newSupplier}
            onChange={(e) => setNewSupplier(e.target.value)}
            className="max-w-sm"
          />
          <Button 
            onClick={handleAddSupplier} 
            disabled={!newSupplier.trim() || isLoading}
            type="button"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Supplier
          </Button>
        </div>

        <div className="border rounded-md">
          {suppliers.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No suppliers yet. Add your first supplier above.
            </div>
          ) : (
            <div className="divide-y">
              {suppliers.map((supplier) => (
                <div key={supplier} className="flex items-center justify-between p-3 hover:bg-gray-50">
                  <span>{supplier}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteSupplier(supplier)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
