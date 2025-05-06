
import { Button } from "@/components/ui/button";
import { RolePreset } from "@/types/permissions";

interface PermissionPresetButtonsProps {
  activePreset: string | null;
  onSelectPreset: (preset: RolePreset | null) => void;
}

export function PermissionPresetButtons({ activePreset, onSelectPreset }: PermissionPresetButtonsProps) {
  const presets: RolePreset[] = ["Owner", "Administrator", "Technician", "Customer Service"];
  
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Apply permission template:</p>
      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => (
          <Button
            key={preset}
            variant={activePreset === preset ? "default" : "outline"}
            size="sm"
            onClick={() => onSelectPreset(preset)}
          >
            {preset}
          </Button>
        ))}
        <Button
          variant={activePreset === null ? "default" : "outline"}
          size="sm"
          onClick={() => onSelectPreset(null)}
        >
          Custom
        </Button>
      </div>
    </div>
  );
}
