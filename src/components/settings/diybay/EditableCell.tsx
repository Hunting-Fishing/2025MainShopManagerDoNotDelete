
import React, { useState, useRef, useEffect } from "react";
import { TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Check, X, Pencil } from "lucide-react";

interface EditableCellProps {
  value: number | null;
  onSave: (value: string) => Promise<boolean>;
  isNumber?: boolean;
  formatValue?: (value: number | null) => string;
  disabled?: boolean;
}

export const EditableCell: React.FC<EditableCellProps> = ({
  value,
  onSave,
  isNumber = false,
  formatValue = (val) => val?.toString() || "",
  disabled = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      // Select all text
      inputRef.current.select();
    }
  }, [isEditing]);

  const startEditing = () => {
    if (disabled) return;
    
    // Format the initial value correctly
    if (isNumber && value !== null) {
      setInputValue(value.toString());
    } else {
      setInputValue(value?.toString() || "");
    }
    
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      cancelEditing();
    }
  };

  const handleSave = async () => {
    if (disabled) return;
    
    setIsSaving(true);
    try {
      // Validate input if it's a number
      if (isNumber) {
        const numValue = parseFloat(inputValue);
        if (isNaN(numValue)) {
          setInputValue(value?.toString() || "");
          setIsEditing(false);
          return;
        }
      }

      const success = await onSave(inputValue);
      if (success) {
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error saving value:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isEditing) {
    return (
      <TableCell className="p-0">
        <div className="flex items-center">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            type={isNumber ? "number" : "text"}
            step={isNumber ? "0.01" : undefined}
            className="h-9 w-full rounded-none border-0 focus:ring-2"
            disabled={isSaving}
          />
          <div className="flex space-x-1 px-2">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="text-green-600 hover:text-green-800 p-1 rounded-full hover:bg-green-50"
            >
              <Check className="h-4 w-4" />
            </button>
            <button
              onClick={cancelEditing}
              disabled={isSaving}
              className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </TableCell>
    );
  }

  return (
    <TableCell
      className={`group cursor-pointer ${disabled ? 'opacity-75' : 'hover:bg-blue-50'}`}
      onClick={startEditing}
    >
      <div className="flex items-center justify-between">
        <span>{formatValue(value)}</span>
        {!disabled && (
          <Pencil className="h-3.5 w-3.5 text-gray-400 opacity-0 group-hover:opacity-100 ml-2" />
        )}
      </div>
    </TableCell>
  );
};
