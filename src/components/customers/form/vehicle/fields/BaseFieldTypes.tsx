
import { UseFormReturn } from "react-hook-form";
import { CustomerFormValues } from "../../CustomerFormSchema";

export interface BaseFieldProps {
  form: UseFormReturn<CustomerFormValues>;
  index: number;
}
