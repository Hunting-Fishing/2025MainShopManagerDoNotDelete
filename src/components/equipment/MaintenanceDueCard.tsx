
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Equipment } from "@/types/equipment";
import { Link } from "react-router-dom";
import { CalendarClock } from "lucide-react";

interface MaintenanceDueCardProps {
  equipment: Equipment[];
}

export function MaintenanceDueCard({ equipment }: MaintenanceDueCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <CalendarClock className="h-5 w-5" /> Upcoming Maintenance
        </CardTitle>
      </CardHeader>
      <CardContent>
        {equipment.length === 0 ? (
          <p className="text-sm text-slate-500">No upcoming maintenance due within 30 days.</p>
        ) : (
          <div className="space-y-2">
            {equipment.map((item) => (
              <div key={item.id} className="border-b pb-2 last:border-0">
                <Link to={`/equipment/${item.id}`} className="text-sm font-medium text-blue-600 hover:text-blue-800">
                  {item.name}
                </Link>
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-slate-500">{item.customer}</span>
                  <span className="text-xs font-medium text-red-600">{item.nextMaintenanceDate}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
