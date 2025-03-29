
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface ColorSelectorProps {
  label: string;
  color: string;
  onChange: (value: string) => void;
}

export function ColorSelector({ label, color, onChange }: ColorSelectorProps) {
  const [inputValue, setInputValue] = useState(color);
  
  // Sync input value with color prop
  useEffect(() => {
    setInputValue(color);
  }, [color]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    // Only update if it's a valid hex color
    if (/^#([0-9A-F]{3}){1,2}$/i.test(newValue)) {
      onChange(newValue);
    }
  };

  const handleColorPickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex space-x-2">
        <div 
          className="h-10 w-10 rounded-md border cursor-pointer overflow-hidden relative"
          style={{ backgroundColor: inputValue }}
        >
          <input 
            type="color" 
            value={inputValue}
            onChange={handleColorPickerChange}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            aria-label={`Color picker for ${label}`}
          />
        </div>
        <Input 
          value={inputValue}
          onChange={handleInputChange}
          placeholder="#000000"
          className="flex-1"
        />
      </div>
    </div>
  );
}
