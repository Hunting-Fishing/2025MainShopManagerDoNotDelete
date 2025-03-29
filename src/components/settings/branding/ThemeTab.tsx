
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { ThemeSelector } from "./ThemeSelector";
import { ThemePreview } from "./ThemePreview";
import { Label } from "@/components/ui/label";
import { useTheme } from "@/context/ThemeContext";

export function ThemeTab() {
  const { theme, setTheme } = useTheme();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Theme Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ThemeSelector theme={theme} setTheme={setTheme} />
          
          <div className="space-y-2">
            <Label>Preview</Label>
            <ThemePreview theme={theme} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
