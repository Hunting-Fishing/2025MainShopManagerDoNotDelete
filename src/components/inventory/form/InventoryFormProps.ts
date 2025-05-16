
import { InventoryItemExtended } from "@/types/inventory";

export interface InventoryFormProps {
  initialValues?: Partial<InventoryItemExtended>;
  onSubmit: (values: Partial<InventoryItemExtended>) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  title?: string;
}

export interface InventoryFormFieldProps {
  label: string;
  name: string;
  error?: string;
  required?: boolean;
  description?: string;
}
