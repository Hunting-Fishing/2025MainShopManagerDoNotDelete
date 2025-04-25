
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

export function NoInventoryAlerts() {
  return (
    <Card>
      <CardContent className="flex items-center justify-center p-6">
        <div className="text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-green-500 mb-2" />
          <h3 className="text-lg font-semibold mb-1">No Inventory Alerts</h3>
          <p className="text-sm text-muted-foreground">
            All inventory items are currently at healthy levels.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
