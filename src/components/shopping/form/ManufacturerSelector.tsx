
import { UseFormWatch, UseFormSetValue } from 'react-hook-form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ManufacturerSelectorProps {
  manufacturers: string[];
  watch: UseFormWatch<any>;
  setValue: UseFormSetValue<any>;
}

export function ManufacturerSelector({ 
  manufacturers, 
  watch, 
  setValue 
}: ManufacturerSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium flex items-center">
        Manufacturer
      </label>
      <Select
        value={watch('manufacturer') || ''}
        onValueChange={(value) => setValue('manufacturer', value)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select a manufacturer" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">ALL</SelectItem>
          {manufacturers.map((manufacturer) => (
            <SelectItem key={manufacturer} value={manufacturer}>
              {manufacturer}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
