
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, BellPlus, Package, ShoppingCart } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useInventoryManager } from "@/hooks/useInventoryManager";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LowStockAlerts() {
  const { 
    lowStockItems, 
    outOfStockItems, 
    reorderItem,
    enableAutoReorder,
    autoReorderSettings 
  } = useInventoryManager();
  
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [reorderQuantity, setReorderQuantity] = useState(10);
  const [autoReorderThreshold, setAutoReorderThreshold] = useState(5);
  const [autoReorderQuantity, setAutoReorderQuantity] = useState(20);
  const [isReorderDialogOpen, setIsReorderDialogOpen] = useState(false);
  const [isAutoReorderDialogOpen, setIsAutoReorderDialogOpen] = useState(false);

  const allAlertItems = [...lowStockItems, ...outOfStockItems];
  
  const handleReorder = () => {
    if (selectedItem) {
      reorderItem(selectedItem, reorderQuantity);
      setIsReorderDialogOpen(false);
    }
  };
  
  const handleEnableAutoReorder = () => {
    if (selectedItem) {
      enableAutoReorder(selectedItem, autoReorderThreshold, autoReorderQuantity);
      setIsAutoReorderDialogOpen(false);
    }
  };
  
  if (allAlertItems.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="mr-2 h-5 w-5 text-slate-500" />
            Inventory Alerts
          </CardTitle>
          <CardDescription>All inventory items are at adequate stock levels</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="rounded-full bg-green-100 p-3 mb-4">
              <Package className="h-6 w-6 text-green-600" />
            </div>
            <p className="text-sm text-slate-500">No low stock or out of stock items</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <AlertTriangle className="mr-2 h-5 w-5 text-amber-500" />
          Inventory Alerts
        </CardTitle>
        <CardDescription>Items that require attention and reordering</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Current Stock</TableHead>
              <TableHead>Reorder Point</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allAlertItems.map(item => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>{item.reorderPoint}</TableCell>
                <TableCell>
                  <Badge variant={item.quantity === 0 ? "destructive" : "outline"} className={
                    item.quantity === 0 
                      ? "bg-red-100 text-red-800 hover:bg-red-100" 
                      : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                  }>
                    {item.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Dialog open={isReorderDialogOpen && selectedItem === item.id} onOpenChange={(open) => {
                    setIsReorderDialogOpen(open);
                    if (!open) setSelectedItem(null);
                  }}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedItem(item.id)}
                      >
                        <ShoppingCart className="h-4 w-4 mr-1" />
                        Reorder
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Reorder Item</DialogTitle>
                        <DialogDescription>
                          Specify the quantity you want to order for {item.name}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="quantity">Quantity to Order</Label>
                          <Input 
                            id="quantity" 
                            type="number" 
                            min="1"
                            value={reorderQuantity}
                            onChange={(e) => setReorderQuantity(parseInt(e.target.value) || 1)}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={handleReorder}>Place Order</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Dialog open={isAutoReorderDialogOpen && selectedItem === item.id} onOpenChange={(open) => {
                    setIsAutoReorderDialogOpen(open);
                    if (!open) setSelectedItem(null);
                  }}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setSelectedItem(item.id)}
                      >
                        <BellPlus className="h-4 w-4 mr-1" />
                        Auto-reorder
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Configure Auto-reorder</DialogTitle>
                        <DialogDescription>
                          Set up automatic reordering for {item.name}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="threshold">Reorder When Stock Falls Below</Label>
                          <Input 
                            id="threshold" 
                            type="number" 
                            min="1"
                            value={autoReorderThreshold}
                            onChange={(e) => setAutoReorderThreshold(parseInt(e.target.value) || 1)}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="auto-quantity">Quantity to Order Automatically</Label>
                          <Input 
                            id="auto-quantity" 
                            type="number" 
                            min="1"
                            value={autoReorderQuantity}
                            onChange={(e) => setAutoReorderQuantity(parseInt(e.target.value) || 1)}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={handleEnableAutoReorder}>
                          {autoReorderSettings[item.id]?.enabled 
                            ? "Update Auto-reorder" 
                            : "Enable Auto-reorder"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
