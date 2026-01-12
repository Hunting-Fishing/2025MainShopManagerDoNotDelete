import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  DollarSign, TrendingUp, History, 
  Settings, Zap, Bell, ArrowUpRight, ArrowDownRight,
  Droplets, ArrowLeft
} from "lucide-react";
import { format, subDays } from "date-fns";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useWaterUnits } from '@/hooks/water-delivery/useWaterUnits';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

export default function WaterDeliveryPricing() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { getVolumeLabel, getPriceLabel } = useWaterUnits();
  
  const { data: products } = useQuery({
    queryKey: ['water-delivery-products'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('water_delivery_products')
        .select('*')
        .order('product_name');
      if (error) throw error;
      return data;
    }
  });

  const updateProduct = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; base_price_per_unit?: number }) => {
      const { error } = await (supabase as any)
        .from('water_delivery_products')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['water-delivery-products'] });
      toast.success('Price updated');
    }
  });
  
  const [priceUpdateDialog, setPriceUpdateDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [newPrice, setNewPrice] = useState("");
  const [priceChangeReason, setPriceChangeReason] = useState("");
  const [automationSettings, setAutomationSettings] = useState({
    autoAdjust: false,
    marginPercent: 20,
    alertThreshold: 5,
    roundToNearest: 0.05
  });

  const handleUpdatePrice = async () => {
    if (!selectedProduct || !newPrice) {
      toast.error("Please enter a new price");
      return;
    }

    const priceNum = parseFloat(newPrice);

    await updateProduct.mutateAsync({
      id: selectedProduct.id,
      base_price_per_unit: priceNum
    });

    toast.success("Price updated successfully");
    setPriceUpdateDialog(false);
    setSelectedProduct(null);
    setNewPrice("");
    setPriceChangeReason("");
  };

  const chartData = Array.from({ length: 30 }, (_, i) => ({
    date: format(subDays(new Date(), 29 - i), 'MMM d'),
    'Potable Water': 0.02 + Math.random() * 0.005,
    'Non-Potable': 0.015 + Math.random() * 0.003,
  }));

  const colors = ['#06b6d4', '#3b82f6', '#10b981'];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Button variant="ghost" onClick={() => navigate('/water-delivery')} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Dashboard
      </Button>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <DollarSign className="h-8 w-8 text-cyan-600" />
            Water Pricing
          </h1>
          <p className="text-muted-foreground">Manage prices and view pricing history</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {products?.map((product: any) => {
          const currentPrice = product.base_price_per_unit || 0;

          return (
            <Card key={product.id} className="relative overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {product.product_name}
                  </CardTitle>
                  <Droplets className="h-4 w-4 text-cyan-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-3xl font-bold">
                      ${currentPrice.toFixed(4)}
                    </div>
                    <div className="text-sm text-muted-foreground">{getPriceLabel(false)}</div>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-4"
                  onClick={() => {
                    setSelectedProduct(product);
                    setNewPrice(currentPrice.toString());
                    setPriceUpdateDialog(true);
                  }}
                >
                  Update Price
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="history" className="space-y-4">
        <TabsList>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Price History
          </TabsTrigger>
          <TabsTrigger value="automation" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Automation
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Price Alerts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Price Trends (Last 30 Days)</CardTitle>
              <CardDescription>Track price changes over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} tickLine={false} />
                    <YAxis tick={{ fontSize: 12 }} tickLine={false} tickFormatter={(value) => `$${value}`} />
                    <Tooltip 
                      formatter={(value: any) => [`$${value?.toFixed(4)}`, '']}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="Potable Water" stroke={colors[0]} strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="Non-Potable" stroke={colors[1]} strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Pricing Automation
              </CardTitle>
              <CardDescription>Configure automatic price adjustments based on market conditions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-0.5">
                  <Label className="text-base">Auto-Adjust Prices</Label>
                  <p className="text-sm text-muted-foreground">Automatically adjust prices based on cost changes</p>
                </div>
                <Switch 
                  checked={automationSettings.autoAdjust}
                  onCheckedChange={(checked) => setAutomationSettings({ ...automationSettings, autoAdjust: checked })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Target Margin (%)</Label>
                  <Input
                    type="number"
                    value={automationSettings.marginPercent}
                    onChange={(e) => setAutomationSettings({ ...automationSettings, marginPercent: parseFloat(e.target.value) })}
                    placeholder="20"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Alert Threshold (%)</Label>
                  <Input
                    type="number"
                    value={automationSettings.alertThreshold}
                    onChange={(e) => setAutomationSettings({ ...automationSettings, alertThreshold: parseFloat(e.target.value) })}
                    placeholder="5"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Round to Nearest</Label>
                  <Select 
                    value={automationSettings.roundToNearest.toString()}
                    onValueChange={(value) => setAutomationSettings({ ...automationSettings, roundToNearest: parseFloat(value) })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0.001">$0.001</SelectItem>
                      <SelectItem value="0.005">$0.005</SelectItem>
                      <SelectItem value="0.01">$0.01</SelectItem>
                      <SelectItem value="0.05">$0.05</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button className="w-full md:w-auto" onClick={() => toast.success("Automation settings saved")}>
                <Settings className="h-4 w-4 mr-2" />
                Save Automation Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Price Alerts
              </CardTitle>
              <CardDescription>Get notified about significant price changes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 border rounded-lg text-center text-muted-foreground">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No active alerts. Configure thresholds to receive notifications.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={priceUpdateDialog} onOpenChange={setPriceUpdateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Price - {selectedProduct?.product_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>New Price ({getPriceLabel(false)})</Label>
              <Input
                type="number"
                step="0.0001"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                placeholder="0.0200"
              />
            </div>
            <div className="space-y-2">
              <Label>Reason for Change (optional)</Label>
              <Input
                value={priceChangeReason}
                onChange={(e) => setPriceChangeReason(e.target.value)}
                placeholder="e.g., Seasonal adjustment"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPriceUpdateDialog(false)}>Cancel</Button>
            <Button onClick={handleUpdatePrice} disabled={updateProduct.isPending}>
              {updateProduct.isPending ? 'Updating...' : 'Update Price'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
