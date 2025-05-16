
import { InventoryItemExtended } from "@/types/inventory";

export interface InventoryFormProps {
  formData: Omit<InventoryItemExtended, "id">;
  handleChange: (field: keyof Omit<InventoryItemExtended, "id">, value: any) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleTextAreaChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSelectChange: (field: keyof Omit<InventoryItemExtended, "id">, value: string) => void;
  handleRadioChange: (field: keyof Omit<InventoryItemExtended, "id">, value: string) => void;
  formErrors: Record<string, string>;
  categories: string[];
  suppliers: string[];
  onSubmit: (formData: Omit<InventoryItemExtended, "id">) => Promise<void> | void;
  loading: boolean;
  onCancel: () => void;
}
