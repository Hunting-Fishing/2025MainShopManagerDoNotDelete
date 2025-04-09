
import React from "react";
import { Link } from "react-router-dom";
import { 
  Calendar, 
  Car, 
  User, 
  Tag, 
  FileText, 
  AlertTriangle, 
  Clock, 
  Info
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CustomerVehicle } from "@/types/customer";

interface VehicleDetailHeaderProps {
  vehicle: CustomerVehicle;
  customerName: string;
  customerId: string;
}

export const VehicleDetailHeader: React.FC<VehicleDetailHeaderProps> = ({
  vehicle,
  customerName,
  customerId,
}) => {
  // Show alert if the vehicle has no service history
  const noServiceHistoryAlert = !vehicle.last_service_date && (
    <div className="flex items-center gap-2 text-amber-600 text-sm">
      <AlertTriangle className="h-4 w-4" />
      <span>No service history recorded</span>
    </div>
  );

  // Extract NHTSA information to display
  const hasNhtsaInfo = vehicle.transmission || vehicle.drive_type || 
    vehicle.fuel_type || vehicle.engine || vehicle.body_style;

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <Card className="md:col-span-2">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between">
            <div className="mb-4 sm:mb-0">
              <h3 className="text-2xl font-bold flex items-center">
                <Car className="h-5 w-5 mr-2 text-primary" />
                {vehicle.year} {vehicle.make} {vehicle.model}
                {vehicle.trim && <span className="ml-1 text-muted-foreground">{vehicle.trim}</span>}
              </h3>
              
              <div className="flex flex-wrap items-center mt-1 space-x-2">
                {vehicle.license_plate && (
                  <Badge variant="outline" className="flex items-center">
                    <Tag className="h-3 w-3 mr-1" /> 
                    {vehicle.license_plate}
                  </Badge>
                )}
                {vehicle.color && (
                  <Badge variant="outline" className="flex items-center">
                    <span 
                      className="h-3 w-3 rounded-full mr-1"
                      style={{ 
                        backgroundColor: vehicle.color.toLowerCase(),
                        border: '1px solid #ccc'
                      }}
                    /> 
                    {vehicle.color}
                  </Badge>
                )}
                {vehicle.vin && (
                  <Badge variant="outline" className="flex items-center font-mono">
                    VIN: {vehicle.vin}
                  </Badge>
                )}
                {vehicle.body_style && (
                  <Badge variant="outline" className="flex items-center">
                    {vehicle.body_style}
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-2 mt-2 text-muted-foreground text-sm">
                <User className="h-4 w-4" />
                <Link to={`/customers/${customerId}`} className="hover:underline">
                  {customerName}
                </Link>
              </div>
              
              {vehicle.last_service_date && (
                <div className="flex items-center gap-2 mt-2 text-muted-foreground text-sm">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Last service: {new Date(vehicle.last_service_date).toLocaleDateString()}
                  </span>
                </div>
              )}
              
              {noServiceHistoryAlert}
            </div>
            
            <div className="flex flex-col gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link to={`/vehicle-inspection?vehicleId=${vehicle.id}`}>
                  <FileText className="h-4 w-4 mr-1" /> New Inspection
                </Link>
              </Button>
            </div>
          </div>
          
          {hasNhtsaInfo && (
            <div className="mt-4 pt-4 border-t">
              <h4 className="text-sm font-medium mb-2 flex items-center">
                <Info className="h-4 w-4 mr-1" /> Vehicle Specifications
              </h4>
              <div className="grid grid-cols-2 gap-x-8 gap-y-1 sm:grid-cols-3 text-sm">
                {vehicle.transmission && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Transmission:</span>
                    <span>{vehicle.transmission}</span>
                  </div>
                )}
                {vehicle.drive_type && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Drive:</span>
                    <span>{vehicle.drive_type}</span>
                  </div>
                )}
                {vehicle.fuel_type && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Fuel:</span>
                    <span>{vehicle.fuel_type}</span>
                  </div>
                )}
                {vehicle.engine && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Engine:</span>
                    <span>{vehicle.engine}</span>
                  </div>
                )}
                {vehicle.body_style && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Body:</span>
                    <span>{vehicle.body_style}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-medium mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link to={`/work-orders/create?customerId=${customerId}&vehicleId=${vehicle.id}`}>
                <FileText className="h-4 w-4 mr-2" /> Create Work Order
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link to={`/service-reminders/create?vehicleId=${vehicle.id}`}>
                <Calendar className="h-4 w-4 mr-2" /> Schedule Service
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link to={`/vehicles/${vehicle.id}/edit?customerId=${customerId}`}>
                <Car className="h-4 w-4 mr-2" /> Edit Vehicle Details
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
