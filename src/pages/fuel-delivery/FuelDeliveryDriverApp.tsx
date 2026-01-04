import { useState } from "react";
import { 
  useFuelDeliveryOrders, 
  useUpdateFuelDeliveryOrder,
  useFuelDeliveryProducts,
  useCreateFuelDeliveryCompletion
} from "@/hooks/useFuelDelivery";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Truck, MapPin, Clock, CheckCircle2, AlertCircle, 
  Navigation, Fuel, User, Droplets
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function FuelDeliveryDriverApp() {
  const { data: orders } = useFuelDeliveryOrders();
  const updateOrder = useUpdateFuelDeliveryOrder();
  const createCompletion = useCreateFuelDeliveryCompletion();
  const { data: products } = useFuelDeliveryProducts();
  
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [completionDialog, setCompletionDialog] = useState(false);
  const [completionData, setCompletionData] = useState({
    gallons_delivered: "",
    delivery_notes: "",
    tank_level_before: "",
    tank_level_after: "",
    signature_data: ""
  });

  const todaysOrders = orders?.filter(o => 
    o.status !== 'completed' && o.status !== 'cancelled' &&
    format(new Date(o.scheduled_date || o.order_date), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
  ) || [];

  const completedToday = orders?.filter(o => 
    o.status === 'completed' &&
    format(new Date(o.scheduled_date || o.order_date), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
  ) || [];

  const handleStartDelivery = async (order: any) => {
    await updateOrder.mutateAsync({ id: order.id, status: 'in_transit' });
    toast.success("Delivery started - navigate to location");
  };

  const handleArrived = async (order: any) => {
    await updateOrder.mutateAsync({ id: order.id, status: 'delivering' });
    toast.success("Arrived at location");
  };

  const handleCompleteDelivery = async () => {
    if (!selectedOrder || !completionData.gallons_delivered) {
      toast.error("Please enter gallons delivered");
      return;
    }

    await createCompletion.mutateAsync({
      order_id: selectedOrder.id,
      gallons_delivered: parseFloat(completionData.gallons_delivered),
      notes: completionData.delivery_notes,
      tank_level_before: completionData.tank_level_before ? parseFloat(completionData.tank_level_before) : undefined,
      tank_level_after: completionData.tank_level_after ? parseFloat(completionData.tank_level_after) : undefined,
      signature_url: completionData.signature_data || undefined,
      delivery_date: new Date().toISOString()
    });

    await updateOrder.mutateAsync({ id: selectedOrder.id, status: 'completed' });
    
    setCompletionDialog(false);
    setSelectedOrder(null);
    setCompletionData({
      gallons_delivered: "",
      delivery_notes: "",
      tank_level_before: "",
      tank_level_after: "",
      signature_data: ""
    });
    toast.success("Delivery completed!");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/10 text-yellow-500';
      case 'confirmed': return 'bg-blue-500/10 text-blue-500';
      case 'in_transit': return 'bg-purple-500/10 text-purple-500';
      case 'delivering': return 'bg-orange-500/10 text-orange-500';
      case 'completed': return 'bg-green-500/10 text-green-500';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Mobile Header */}
      <div className="sticky top-0 z-50 bg-primary text-primary-foreground p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="h-6 w-6" />
            <span className="font-bold text-lg">Driver App</span>
          </div>
          <Badge variant="secondary" className="text-sm">
            {format(new Date(), 'MMM d, yyyy')}
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 p-4">
        <Card className="bg-card">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-primary">{todaysOrders.length}</div>
            <div className="text-sm text-muted-foreground">Pending</div>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-green-500">{completedToday.length}</div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending" className="px-4">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="pending">Pending ({todaysOrders.length})</TabsTrigger>
          <TabsTrigger value="completed">Done ({completedToday.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4">
          <ScrollArea className="h-[calc(100vh-280px)]">
            <div className="space-y-3">
              {todaysOrders.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-green-500" />
                    <p>All deliveries complete!</p>
                  </CardContent>
                </Card>
              ) : (
                todaysOrders.map((order) => (
                  <Card key={order.id} className="overflow-hidden">
                    <CardHeader className="p-4 pb-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Order #{order.order_number}
                          </CardTitle>
                          <Badge className={`mt-1 ${getStatusColor(order.status)}`}>
                            {order.status}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {order.fuel_delivery_locations?.address ? 'Scheduled' : 'Any time'}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-2 space-y-3">
                      <div className="flex items-start gap-2 text-sm">
                        <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                        <span>{order.fuel_delivery_locations?.address || 'Address not specified'}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <Droplets className="h-4 w-4 text-blue-500" />
                        <span className="font-medium">
                          {order.quantity_ordered} gallons - {order.fuel_delivery_products?.product_name || 'Fuel'}
                        </span>
                      </div>

                      {order.special_instructions && (
                        <div className="flex items-start gap-2 text-sm bg-muted/50 p-2 rounded">
                          <AlertCircle className="h-4 w-4 mt-0.5 text-yellow-500" />
                          <span>{order.special_instructions}</span>
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        {order.status === 'pending' || order.status === 'confirmed' || order.status === 'scheduled' ? (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="flex-1"
                              onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(order.fuel_delivery_locations?.address || '')}`, '_blank')}
                            >
                              <Navigation className="h-4 w-4 mr-1" />
                              Navigate
                            </Button>
                            <Button 
                              size="sm" 
                              className="flex-1"
                              onClick={() => handleStartDelivery(order)}
                            >
                              <Truck className="h-4 w-4 mr-1" />
                              Start
                            </Button>
                          </>
                        ) : order.status === 'in_transit' ? (
                          <Button 
                            size="sm" 
                            className="w-full bg-orange-500 hover:bg-orange-600"
                            onClick={() => handleArrived(order)}
                          >
                            <MapPin className="h-4 w-4 mr-1" />
                            I've Arrived
                          </Button>
                        ) : order.status === 'delivering' ? (
                          <Button 
                            size="sm" 
                            className="w-full bg-green-500 hover:bg-green-600"
                            onClick={() => {
                              setSelectedOrder(order);
                              setCompletionData({
                                ...completionData,
                                gallons_delivered: order.quantity_ordered?.toString() || ""
                              });
                              setCompletionDialog(true);
                            }}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Complete Delivery
                          </Button>
                        ) : null}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="completed" className="mt-4">
          <ScrollArea className="h-[calc(100vh-280px)]">
            <div className="space-y-3">
              {completedToday.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    <Truck className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No completed deliveries yet</p>
                  </CardContent>
                </Card>
              ) : (
                completedToday.map((order) => (
                  <Card key={order.id} className="opacity-75">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Order #{order.order_number}</div>
                          <div className="text-sm text-muted-foreground">
                            {order.quantity_ordered} gallons delivered
                          </div>
                        </div>
                        <CheckCircle2 className="h-6 w-6 text-green-500" />
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {/* Completion Dialog */}
      <Dialog open={completionDialog} onOpenChange={setCompletionDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Fuel className="h-5 w-5" />
              Complete Delivery
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Gallons Delivered *</Label>
              <Input
                type="number"
                step="0.1"
                value={completionData.gallons_delivered}
                onChange={(e) => setCompletionData({ ...completionData, gallons_delivered: e.target.value })}
                placeholder="Enter gallons"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Tank Level Before (%)</Label>
                <Input
                  type="number"
                  value={completionData.tank_level_before}
                  onChange={(e) => setCompletionData({ ...completionData, tank_level_before: e.target.value })}
                  placeholder="0-100"
                />
              </div>
              <div className="space-y-2">
                <Label>Tank Level After (%)</Label>
                <Input
                  type="number"
                  value={completionData.tank_level_after}
                  onChange={(e) => setCompletionData({ ...completionData, tank_level_after: e.target.value })}
                  placeholder="0-100"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Delivery Notes</Label>
              <Textarea
                value={completionData.delivery_notes}
                onChange={(e) => setCompletionData({ ...completionData, delivery_notes: e.target.value })}
                placeholder="Any notes about the delivery..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCompletionDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCompleteDelivery}
              disabled={createCompletion.isPending}
              className="bg-green-500 hover:bg-green-600"
            >
              <CheckCircle2 className="h-4 w-4 mr-1" />
              Complete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
