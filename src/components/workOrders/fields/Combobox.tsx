
import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface ComboboxItem {
  label: string;
  value: string;
}

interface ComboboxProps {
  items: ComboboxItem[];
  placeholder: string;
  onItemSelected: (value: string) => void;
  isDisabled?: boolean;
}

export function Combobox({ 
  items = [], 
  placeholder = "Select an item...", 
  onItemSelected,
  isDisabled = false 
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");
  const [selectedLabel, setSelectedLabel] = React.useState("");

  return (
    <Popover open={open && !isDisabled} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={isDisabled}
        >
          {value ? selectedLabel : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search items..." />
          <CommandEmpty>No items found.</CommandEmpty>
          <CommandGroup className="max-h-64 overflow-y-auto">
            {items.map((item) => (
              <CommandItem
                key={item.value}
                value={item.value}
                onSelect={(currentValue) => {
                  const isSelected = value === currentValue;
                  setValue(isSelected ? "" : currentValue);
                  setSelectedLabel(isSelected ? "" : item.label);
                  setOpen(false);
                  if (!isSelected) {
                    onItemSelected(currentValue);
                  }
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === item.value ? "opacity-100" : "opacity-0"
                  )}
                />
                {item.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
