
import { InventoryItemExtended } from "@/types/inventory";

export interface InventoryFormProps {
  item?: InventoryItemExtended;
  onSubmit: (formData: Omit<InventoryItemExtended, "id">) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}
