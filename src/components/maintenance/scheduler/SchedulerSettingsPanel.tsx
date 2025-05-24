
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";

export function SchedulerSettingsPanel() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Schedule Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Schedule settings configuration will be available here. This includes default maintenance intervals, 
            notification preferences, and automated scheduling rules.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
