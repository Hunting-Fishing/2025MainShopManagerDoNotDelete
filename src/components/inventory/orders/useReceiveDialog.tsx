
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useInventoryOrders } from "@/hooks/inventory/useInventoryOrders";
import { InventoryOrder, ReceiveInventoryOrderDto } from "@/types/inventory/orders";

export function useReceiveDialog() {
  const [open, setOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<InventoryOrder | null>(null);
  const [quantityToReceive, setQuantityToReceive] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const { receiveItems } = useInventoryOrders();

  const openReceiveDialog = (order: InventoryOrder) => {
    setSelectedOrder(order);
    // Default to receiving the remaining quantity
    const remainingQuantity = order.quantity_ordered - order.quantity_received;
    setQuantityToReceive(remainingQuantity);
    setOpen(true);
  };

  const closeDialog = () => {
    setOpen(false);
    setSelectedOrder(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedOrder) return;
    
    setLoading(true);
    
    try {
      const params: ReceiveInventoryOrderDto = {
        order_id: selectedOrder.id,
        quantity_to_receive: quantityToReceive
      };
      
      await receiveItems(params);
      closeDialog();
    } catch (error) {
      console.error("Failed to receive items:", error);
    } finally {
      setLoading(false);
    }
  };

  const maxRemainingQuantity = selectedOrder 
    ? selectedOrder.quantity_ordered - selectedOrder.quantity_received 
    : 0;

  const ReceiveDialog = () => (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Receive Inventory</DialogTitle>
            <DialogDescription>
              Update inventory by receiving items from order.
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 gap-2">
                <p className="text-sm font-medium">Item: <span className="font-normal">{selectedOrder.item_name}</span></p>
                <p className="text-sm font-medium">Supplier: <span className="font-normal">{selectedOrder.supplier}</span></p>
                <p className="text-sm font-medium">Total Ordered: <span className="font-normal">{selectedOrder.quantity_ordered}</span></p>
                <p className="text-sm font-medium">Already Received: <span className="font-normal">{selectedOrder.quantity_received}</span></p>
                <p className="text-sm font-medium">Remaining: <span className="font-normal">{maxRemainingQuantity}</span></p>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="quantity_to_receive" className="text-right">
                  Quantity to Receive
                </Label>
                <div className="col-span-3">
                  <Input
                    id="quantity_to_receive"
                    name="quantity_to_receive"
                    type="number"
                    min="1"
                    max={maxRemainingQuantity}
                    value={quantityToReceive}
                    onChange={(e) => setQuantityToReceive(parseInt(e.target.value) || 0)}
                    disabled={loading}
                    required
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeDialog} disabled={loading}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || quantityToReceive < 1 || quantityToReceive > maxRemainingQuantity}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? "Processing..." : "Receive Items"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );

  return {
    openReceiveDialog,
    ReceiveDialog,
  };
}
