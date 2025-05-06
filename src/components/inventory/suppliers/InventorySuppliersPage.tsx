
import React, { useEffect, useState } from "react";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PlusCircle, Pencil, Trash } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  getInventorySuppliers, 
  addInventorySupplier, 
  deleteInventorySupplier 
} from "@/services/inventory/supplierService";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export function InventorySuppliersPage() {
  const [suppliers, setSuppliers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newSupplier, setNewSupplier] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
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

    setIsSubmitting(true);
    try {
      await addInventorySupplier(newSupplier.trim());
      setSuppliers([...suppliers, newSupplier.trim()].sort());
      setNewSupplier("");
      toast({
        variant: "default",
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
      setIsSubmitting(false);
    }
  };

  const handleDeleteSupplier = async (supplier: string) => {
    if (confirm(`Are you sure you want to delete "${supplier}"?`)) {
      setIsSubmitting(true);
      try {
        await deleteInventorySupplier(supplier);
        setSuppliers(suppliers.filter(s => s !== supplier));
        toast({
          variant: "default",
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
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="container mx-auto">
      <Card className="bg-white shadow-md rounded-xl border border-gray-100">
        <CardHeader>
          <CardTitle className="text-2xl">Inventory Suppliers</CardTitle>
          <CardDescription>
            Manage the suppliers for your inventory items
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-6">
            <Input
              placeholder="New supplier name"
              value={newSupplier}
              onChange={(e) => setNewSupplier(e.target.value)}
              className="max-w-sm"
            />
            <Button 
              onClick={handleAddSupplier} 
              disabled={!newSupplier.trim() || isSubmitting}
              className="rounded-full bg-blue-600 hover:bg-blue-700"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Supplier
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="font-medium">Supplier Name</TableHead>
                    <TableHead className="font-medium text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {suppliers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={2} className="h-[200px] text-center">
                        <div className="flex flex-col items-center justify-center p-8 space-y-4">
                          <div className="text-lg font-medium text-slate-700">No suppliers found</div>
                          <p className="text-slate-500 max-w-md text-center">
                            Add your first supplier above to get started.
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    suppliers.map((supplier) => (
                      <TableRow key={supplier} className="hover:bg-slate-50">
                        <TableCell className="font-medium">{supplier}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteSupplier(supplier)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 ml-2"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
