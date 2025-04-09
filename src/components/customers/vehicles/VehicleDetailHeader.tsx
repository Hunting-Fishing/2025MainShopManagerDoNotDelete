
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
  Info,
  Shield
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
                      vehicle.fuel_type || vehicle.engine || 
                      vehicle.body_style || vehicle.country || 
                      vehicle.transmission_type || vehicle.gvwr;

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-slate-50 to-blue-50 p-6 rounded-xl shadow-sm border border-blue-100">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Car className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-blue-900">
              {vehicle.year ? vehicle.year : ''} {vehicle.make || 'Unknown'} {vehicle.model || 'Unknown'} {vehicle.trim && <span className="text-slate-600">{vehicle.trim}</span>}
            </h2>
          </div>
          <div className="flex items-center gap-2 text-slate-600 text-sm">
            <User className="h-4 w-4" />
            <Link to={`/customers/${customerId}`} className="hover:underline text-blue-600 font-medium">
              {customerName || 'Unknown Customer'}
            </Link>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-slate-600 text-sm mt-1">
            {vehicle.license_plate && (
              <div className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-md">
                <Tag className="h-4 w-4 text-blue-500" />
                <span className="font-medium">{vehicle.license_plate}</span>
              </div>
            )}
            {vehicle.vin && (
              <div className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-md">
                <Shield className="h-4 w-4 text-blue-500" />
                <span className="font-medium font-mono">{vehicle.vin}</span>
              </div>
            )}
            {vehicle.last_service_date && (
              <div className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-md">
                <Clock className="h-4 w-4 text-green-500" />
                <span>
                  Last Service:{" "}
                  {new Date(vehicle.last_service_date).toLocaleDateString()}
                </span>
              </div>
            )}
            {noServiceHistoryAlert}
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            asChild 
            className="bg-white hover:bg-blue-50 border-blue-200"
          >
            <Link to={`/customers/${customerId}/edit?vehicleId=${vehicle.id}`}>
              Edit Vehicle
            </Link>
          </Button>
          <Button 
            variant="default" 
            asChild
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
          >
            <Link to={`/vehicle-inspection/new?vehicleId=${vehicle.id}&customerId=${customerId}`}>
              New Inspection
            </Link>
          </Button>
        </div>
      </div>

      {/* NHTSA Information Card - Quickly visible to the user */}
      {hasNhtsaInfo && (
        <Card className="bg-gradient-to-r from-slate-50 to-blue-50 border-blue-100 shadow-sm overflow-hidden">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-3 text-sm font-medium text-blue-800">
              <Info className="h-4 w-4" />
              <span>Vehicle Specifications</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-2 text-sm">
              {vehicle.transmission && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Transmission:</span>
                  <span className="font-medium">{vehicle.transmission}</span>
                </div>
              )}
              {vehicle.transmission_type && vehicle.transmission_type !== vehicle.transmission && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Trans. Type:</span>
                  <span className="font-medium">{vehicle.transmission_type}</span>
                </div>
              )}
              {vehicle.drive_type && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Drive Type:</span>
                  <span className="font-medium">{vehicle.drive_type}</span>
                </div>
              )}
              {vehicle.fuel_type && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Fuel:</span>
                  <span className="font-medium">{vehicle.fuel_type}</span>
                </div>
              )}
              {vehicle.engine && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Engine:</span>
                  <span className="font-medium">{vehicle.engine}</span>
                </div>
              )}
              {vehicle.body_style && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Body Style:</span>
                  <Badge variant="outline" className="font-normal bg-white">
                    {vehicle.body_style}
                  </Badge>
                </div>
              )}
              {vehicle.trim && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Trim:</span>
                  <span className="font-medium">{vehicle.trim}</span>
                </div>
              )}
              {vehicle.country && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Country:</span>
                  <span className="font-medium">{vehicle.country}</span>
                </div>
              )}
              {vehicle.gvwr && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">GVWR:</span>
                  <span className="font-medium">{vehicle.gvwr}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
