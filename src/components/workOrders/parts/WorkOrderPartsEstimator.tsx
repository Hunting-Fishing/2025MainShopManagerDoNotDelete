
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { PlusCircle, Trash2, Package } from "lucide-react";
import { WorkOrderInventoryItem } from "@/types/workOrder";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mapToInventoryItem } from "@/utils/inventoryAdapters";
import { supabase } from "@/lib/supabase";
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface WorkOrderPartsEstimatorProps {
  initialItems?: WorkOrderInventoryItem[];
  onItemsChange: (items: WorkOrderInventoryItem[]) => void;
  readOnly?: boolean;
  workOrderId?: string;
}

export function WorkOrderPartsEstimator({ 
  initialItems = [],
  onItemsChange,
  readOnly = false,
  workOrderId 
}: WorkOrderPartsEstimatorProps) {
  const [items, setItems] = useState<WorkOrderInventoryItem[]>(initialItems);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [quantity, setQuantity] = useState(1);
  const { toast } = useToast();

  // Initialize with initialItems when available
  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  // Fetch inventory items when needed
  const fetchInventoryItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .order('name');
      
      if (error) {
        throw error;
      }
      
      setInventoryItems(data || []);
    } catch (err) {
      console.error('Error fetching inventory:', err);
      toast({
        title: 'Error',
        description: 'Could not load inventory items',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleShowAddDialog = () => {
    fetchInventoryItems();
    setShowAddDialog(true);
  };

  const handleAddItem = () => {
    if (!selectedItem) return;
    
    const newItem: WorkOrderInventoryItem = {
      id: selectedItem.id,
      name: selectedItem.name,
      sku: selectedItem.sku || '',
      category: selectedItem.category || '',
      quantity: quantity,
      unitPrice: selectedItem.unit_price,
      totalPrice: selectedItem.unit_price * quantity,
      itemStatus: selectedItem.quantity >= quantity ? 'in-stock' : 'ordered'
    };
    
    const updatedItems = [...items, newItem];
    setItems(updatedItems);
    onItemsChange(updatedItems);
    setShowAddDialog(false);
    setSelectedItem(null);
    setQuantity(1);
    
    toast({
      title: "Item Added",
      description: `${selectedItem.name} added to work order`
    });
  };

  const handleRemoveItem = (itemId: string) => {
    const updatedItems = items.filter(item => item.id !== itemId);
    setItems(updatedItems);
    onItemsChange(updatedItems);
  };

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    const updatedItems = items.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          quantity: newQuantity,
          totalPrice: item.unitPrice * newQuantity
        };
      }
      return item;
    });
    
    setItems(updatedItems);
    onItemsChange(updatedItems);
  };

  const getStatusBadgeClass = (status?: string) => {
    switch(status) {
      case 'in-stock':
        return "bg-green-100 text-green-800 border-green-300";
      case 'ordered':
        return "bg-blue-100 text-blue-800 border-blue-300";
      case 'special-order':
        return "bg-purple-100 text-purple-800 border-purple-300";
      case 'used-part':
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case 'misc':
      default:
        return "bg-slate-100 text-slate-800 border-slate-300";
    }
  };

  // Calculate total cost
  const totalCost = items.reduce((sum, item) => {
    return sum + (item.totalPrice || item.unitPrice * item.quantity);
  }, 0);

  // Filter inventory items based on search query
  const filteredInventoryItems = inventoryItems.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.sku && item.sku.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between border-b">
          <CardTitle className="text-lg font-medium">Parts & Materials</CardTitle>
          {!readOnly && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleShowAddDialog} 
              className="h-8"
            >
              <PlusCircle className="mr-1 h-4 w-4" />
              Add Part
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-0">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <Package className="h-12 w-12 text-muted-foreground/50 mb-3" />
              <div className="text-muted-foreground text-sm">No parts or materials added yet.</div>
              {!readOnly && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleShowAddDialog} 
                  className="mt-4"
                >
                  <PlusCircle className="mr-1 h-4 w-4" />
                  Add Part or Material
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead className="hidden sm:table-cell">SKU</TableHead>
                  <TableHead className="hidden sm:table-cell">Status</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  {!readOnly && <TableHead className="w-[50px]"></TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item, index) => (
                  <TableRow key={`${item.id}-${index}`}>
                    <TableCell>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-muted-foreground sm:hidden">{item.sku}</div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{item.sku}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {item.itemStatus && (
                        <Badge variant="outline" className={getStatusBadgeClass(item.itemStatus)}>
                          {item.itemStatus.replace('-', ' ')}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">${item.unitPrice.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      {readOnly ? (
                        item.quantity
                      ) : (
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1)}
                          className="w-16 text-right"
                        />
                      )}
                    </TableCell>
                    <TableCell className="text-right">${(item.totalPrice || (item.unitPrice * item.quantity)).toFixed(2)}</TableCell>
                    {!readOnly && (
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
                
                {/* Total Row */}
                <TableRow>
                  <TableCell colSpan={readOnly ? 5 : 6} className="text-right font-medium">
                    Total:
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    ${totalCost.toFixed(2)}
                  </TableCell>
                  {!readOnly && <TableCell />}
                </TableRow>
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add Item Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Inventory Item</DialogTitle>
            <DialogDescription>
              Select an inventory item to add to this work order
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <Input
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            
            <div className="max-h-[300px] overflow-y-auto border rounded-md divide-y">
              {loading ? (
                <div className="p-4 text-center">Loading inventory items...</div>
              ) : filteredInventoryItems.length === 0 ? (
                <div className="p-4 text-center">No items found</div>
              ) : (
                filteredInventoryItems.map(item => (
                  <div
                    key={item.id}
                    className={`p-2 cursor-pointer hover:bg-muted ${selectedItem?.id === item.id ? 'bg-muted' : ''}`}
                    onClick={() => setSelectedItem(item)}
                  >
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {item.sku} | {item.quantity} in stock | ${item.unit_price?.toFixed(2)}
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {selectedItem && (
              <div className="space-y-2 border-t pt-4">
                <div className="text-sm font-medium">Quantity:</div>
                <Input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                />
              </div>
            )}
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddItem} disabled={!selectedItem}>
                Add Item
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
