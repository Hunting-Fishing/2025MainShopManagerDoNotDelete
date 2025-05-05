
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useInventoryOrders } from "@/hooks/inventory/useInventoryOrders";

export function useCancelDialog() {
  const [open, setOpen] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { cancelOrder } = useInventoryOrders();

  const openCancelDialog = (id: string) => {
    setOrderId(id);
    setOpen(true);
  };

  const closeDialog = () => {
    setOpen(false);
    setOrderId(null);
  };

  const handleCancel = async () => {
    if (!orderId) return;
    
    setLoading(true);
    
    try {
      await cancelOrder(orderId);
      closeDialog();
    } catch (error) {
      console.error("Failed to cancel order:", error);
    } finally {
      setLoading(false);
    }
  };

  const CancelDialog = () => (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel Order</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to cancel this order? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Keep Order</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleCancel}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700"
          >
            {loading ? "Cancelling..." : "Cancel Order"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return {
    openCancelDialog,
    CancelDialog,
  };
}
