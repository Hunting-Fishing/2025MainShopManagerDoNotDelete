
import { InventoryItemExtended } from "@/types/inventory";
import { SelectOption } from "./InventoryFormSelect";

export interface InventoryFormProps {
  formData: Omit<InventoryItemExtended, "id">;
  handleChange: (field: keyof Omit<InventoryItemExtended, "id">, value: any) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleTextAreaChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
  handleRadioChange: (name: string, value: string) => void;
  formErrors: Record<string, string>;
  categories: string[] | SelectOption[];
  suppliers: string[] | SelectOption[];
  onSubmit: (formData: Omit<InventoryItemExtended, "id">) => void;
  loading: boolean;
  onCancel: () => void;
}
