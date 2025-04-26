
import React from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface InventoryFormStatusProps {
  value: string;
  onValueChange: (value: string) => void;
}

export function InventoryFormStatus({ value, onValueChange }: InventoryFormStatusProps) {
  return (
    <div className="space-y-2">
      <Label>Status</Label>
      <RadioGroup
        value={value}
        onValueChange={onValueChange}
        className="flex flex-wrap gap-4"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="In Stock" id="in-stock" />
          <Label htmlFor="in-stock" className="cursor-pointer">In Stock</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="Low Stock" id="low-stock" />
          <Label htmlFor="low-stock" className="cursor-pointer">Low Stock</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="Out of Stock" id="out-of-stock" />
          <Label htmlFor="out-of-stock" className="cursor-pointer">Out of Stock</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="Discontinued" id="discontinued" />
          <Label htmlFor="discontinued" className="cursor-pointer">Discontinued</Label>
        </div>
      </RadioGroup>
    </div>
  );
}
