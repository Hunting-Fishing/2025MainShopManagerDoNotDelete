
import { Textarea } from "@/components/ui/textarea";
import { UseFormRegister, FieldError } from "react-hook-form";

interface TextAreaFieldProps {
  label: string;
  name: string;
  register: UseFormRegister<any>;
  error?: FieldError;
  placeholder?: string;
  required?: boolean;
}

export function TextAreaField({
  label,
  name,
  register,
  error,
  placeholder,
  required = false,
}: TextAreaFieldProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium flex items-center">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>
      <Textarea
        {...register(name, required ? { required: `${label} is required` } : {})}
        placeholder={placeholder}
      />
      {error && (
        <p className="text-xs font-medium text-destructive">{error.message as string}</p>
      )}
    </div>
  );
}
