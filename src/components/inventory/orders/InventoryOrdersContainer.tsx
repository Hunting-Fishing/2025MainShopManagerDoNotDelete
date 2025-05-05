
import { InventoryOrdersPage } from "./InventoryOrdersPage";
import { useCreateOrderDialog } from "./useCreateOrderDialog";
import { useReceiveDialog } from "./useReceiveDialog";
import { useCancelDialog } from "./useCancelDialog";

export function InventoryOrdersContainer() {
  const { CreateOrderDialog } = useCreateOrderDialog();
  const { ReceiveDialog } = useReceiveDialog();
  const { CancelDialog } = useCancelDialog();
  
  return (
    <>
      <InventoryOrdersPage />
      <CreateOrderDialog />
      <ReceiveDialog />
      <CancelDialog />
    </>
  );
}
