
import { Package } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function NoInventoryAlerts() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Package className="mr-2 h-5 w-5 text-slate-500" />
          Inventory Alerts
        </CardTitle>
        <CardDescription>All inventory items are at adequate stock levels</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <div className="rounded-full bg-green-100 p-3 mb-4">
            <Package className="h-6 w-6 text-green-600" />
          </div>
          <p className="text-sm text-slate-500">No low stock or out of stock items</p>
        </div>
      </CardContent>
    </Card>
  );
}
