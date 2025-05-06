import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { ShoppingBasket, BarChart2, Truck, Database } from "lucide-react";
import { Link } from "react-router-dom";

export function InventorySettingsTab() {
  const [autoReorder, setAutoReorder] = useState(false);
  const [lowStockThreshold, setLowStockThreshold] = useState(5);
  const [defaultSupplier, setDefaultSupplier] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // This would be replaced with actual API call to save settings to Supabase
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Settings saved",
        description: "Inventory settings have been updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "There was a problem saving your settings",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Inventory Field Manager
          </CardTitle>
          <CardDescription>
            Configure which inventory fields are mandatory or optional
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Manage which fields are required when creating or editing inventory items.
          </p>
          <Link to="/inventory/manager">
            <Button className="w-full bg-esm-blue-600 hover:bg-esm-blue-700">
              Open Field Manager
            </Button>
          </Link>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBasket className="h-5 w-5" />
            Inventory Management
          </CardTitle>
          <CardDescription>
            Configure how inventory is tracked and managed in your shop
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="track-inventory">Track Inventory</Label>
              <p className="text-sm text-muted-foreground">
                Automatically update inventory levels when items are used or sold
              </p>
            </div>
            <Switch id="track-inventory" defaultChecked />
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <Label htmlFor="barcode-scanner">Barcode Scanner Mode</Label>
            <Select defaultValue="search">
              <SelectTrigger id="barcode-scanner">
                <SelectValue placeholder="Select mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="search">Search Only</SelectItem>
                <SelectItem value="auto-add">Auto Add to Work Order</SelectItem>
                <SelectItem value="popup">Show Popup Details</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="inventory-method">Inventory Counting Method</Label>
            <Select defaultValue="fifo">
              <SelectTrigger id="inventory-method">
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fifo">First In, First Out (FIFO)</SelectItem>
                <SelectItem value="lifo">Last In, First Out (LIFO)</SelectItem>
                <SelectItem value="weighted">Weighted Average Cost</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart2 className="h-5 w-5" />
            Stock Levels & Alerts
          </CardTitle>
          <CardDescription>
            Set up automatic alerts and thresholds for inventory management
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="low-stock-alerts">Low Stock Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications when items fall below threshold
              </p>
            </div>
            <Switch id="low-stock-alerts" defaultChecked />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="low-stock-threshold">Low Stock Threshold</Label>
            <Input
              id="low-stock-threshold"
              type="number"
              min="1"
              value={lowStockThreshold}
              onChange={(e) => setLowStockThreshold(Number(e.target.value))}
            />
            <p className="text-xs text-muted-foreground">
              Items with quantities below this number will be flagged as low stock
            </p>
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-reorder">Automatic Reordering</Label>
              <p className="text-sm text-muted-foreground">
                Automatically generate purchase orders for low stock items
              </p>
            </div>
            <Switch 
              id="auto-reorder" 
              checked={autoReorder}
              onCheckedChange={setAutoReorder}
            />
          </div>
          
          {autoReorder && (
            <div className="space-y-2">
              <Label htmlFor="reorder-approval">Reorder Approval</Label>
              <Select defaultValue="required">
                <SelectTrigger id="reorder-approval">
                  <SelectValue placeholder="Select approval type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="automatic">Automatic - No Approval</SelectItem>
                  <SelectItem value="required">Require Manual Approval</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Suppliers & Ordering
          </CardTitle>
          <CardDescription>
            Manage supplier relationships and ordering preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="default-supplier">Default Supplier</Label>
            <Select 
              value={defaultSupplier} 
              onValueChange={setDefaultSupplier}
            >
              <SelectTrigger id="default-supplier">
                <SelectValue placeholder="Select default supplier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="supplier1">AutoZone Commercial</SelectItem>
                <SelectItem value="supplier2">NAPA Auto Parts</SelectItem>
                <SelectItem value="supplier3">O'Reilly Auto Parts</SelectItem>
                <SelectItem value="supplier4">Advance Auto Parts</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="order-approval-threshold">Order Approval Threshold</Label>
            <Input
              id="order-approval-threshold"
              type="number"
              min="0"
              defaultValue="500"
            />
            <p className="text-xs text-muted-foreground">
              Orders above this amount require manager approval (in dollars)
            </p>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end">
        <Button 
          className="bg-esm-blue-600 hover:bg-esm-blue-700"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  );
}
