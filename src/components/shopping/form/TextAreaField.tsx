
import { Textarea } from "@/components/ui/textarea";
import { UseFormRegister, FieldError, FieldErrors } from "react-hook-form";
import { Label } from "@/components/ui/label";

interface TextAreaFieldProps {
  label: string;
  name: string;
  register: UseFormRegister<any>;
  error?: FieldError | FieldErrors;
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
  const fieldId = `field-${name}`;
  
  return (
    <div className="space-y-2">
      <Label htmlFor={fieldId} className="text-sm font-medium flex items-center">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Textarea
        id={fieldId}
        {...register(name, required ? { required: `${label} is required` } : {})}
        placeholder={placeholder}
        className={error ? "border-destructive" : ""}
      />
      {error && (
        <p className="text-xs font-medium text-destructive">
          {(error as FieldError).message as string}
        </p>
      )}
    </div>
  );
}
