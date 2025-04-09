
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, Plus, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { getVehicleInspections } from "@/services/vehicleInspectionService";
import { VehicleInspection } from "@/services/vehicle-inspection/types";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface VehicleInspectionsProps {
  vehicleId: string;
}

export const VehicleInspections: React.FC<VehicleInspectionsProps> = ({ vehicleId }) => {
  const [inspections, setInspections] = useState<VehicleInspection[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInspections = async () => {
      try {
        setLoading(true);
        const fetchedInspections = await getVehicleInspections(vehicleId);
        setInspections(fetchedInspections);
        setError(null);
      } catch (err) {
        console.error("Error fetching vehicle inspections:", err);
        setError("Failed to load inspection history");
      } finally {
        setLoading(false);
      }
    };

    fetchInspections();
  }, [vehicleId]);

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'draft': return "bg-slate-100 text-slate-800";
      case 'completed': return "bg-green-100 text-green-800";
      case 'pending': return "bg-amber-100 text-amber-800";
      case 'approved': return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-bold">Vehicle Inspections</CardTitle>
        <Button variant="outline" asChild>
          <Link to={`/vehicle-inspection?vehicleId=${vehicleId}`}>
            <Plus className="h-4 w-4 mr-2" />
            New Inspection
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-8 text-amber-600">
            <AlertCircle className="h-5 w-5 mr-2" />
            <p>{error}</p>
          </div>
        ) : inspections.length === 0 ? (
          <div className="text-center py-8 border border-dashed rounded-md">
            <FileSpreadsheet className="h-12 w-12 mx-auto text-gray-400" />
            <p className="mt-2 text-muted-foreground">No inspections found</p>
            <Button variant="outline" size="sm" className="mt-4" asChild>
              <Link to={`/vehicle-inspection?vehicleId=${vehicleId}`}>
                <Plus className="h-4 w-4 mr-1" />
                Create First Inspection
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {inspections.map((inspection) => (
              <div 
                key={inspection.id} 
                className="flex items-center justify-between p-4 border rounded-md hover:bg-slate-50"
              >
                <div>
                  <p className="font-medium">
                    Inspection {inspection.id?.substring(0, 8)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(inspection.inspectionDate), 'PP')}
                  </p>
                  <Badge className={`mt-1 ${getStatusBadgeColor(inspection.status)}`}>
                    {inspection.status.charAt(0).toUpperCase() + inspection.status.slice(1)}
                  </Badge>
                </div>
                <Button variant="ghost" asChild>
                  <Link to={`/vehicle-inspection/${inspection.id}`}>
                    View
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
