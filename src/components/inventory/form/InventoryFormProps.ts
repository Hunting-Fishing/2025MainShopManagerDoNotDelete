
// Types for inventory form components
export interface SelectOption {
  value: string;
  label: string;
}

export interface InventoryFormFieldProps {
  label: string;
  name: string;
  value: any;
  onChange: (name: string, value: any) => void;
  required?: boolean;
  error?: string;
}
