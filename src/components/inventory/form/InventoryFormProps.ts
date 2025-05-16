
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
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder?: string;
  type?: string;
  min?: string;
  step?: string;
  as?: string; // Added the 'as' property
}

export interface SelectOption {
  value: string;
  label: string;
}

// Use 'export type' to fix the re-exporting issue
export type { SelectOption as SelectOptionType };
