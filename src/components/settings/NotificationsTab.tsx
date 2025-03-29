
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export function NotificationsTab() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="work-order-notifications">Work Order Updates</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications when work orders are updated
              </p>
            </div>
            <Switch id="work-order-notifications" defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="invoice-notifications">Invoice Updates</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications for invoice status changes
              </p>
            </div>
            <Switch id="invoice-notifications" defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="inventory-notifications">Inventory Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when inventory items are low in stock
              </p>
            </div>
            <Switch id="inventory-notifications" defaultChecked />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
