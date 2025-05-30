
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Phone, MapPin, Car } from "lucide-react";

interface CustomerInfoDisplayProps {
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
  equipmentName?: string;
  equipmentType?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleYear?: string;
  vehicleLicensePlate?: string;
  vehicleVin?: string;
}

export const CustomerInfoDisplay: React.FC<CustomerInfoDisplayProps> = ({
  customerName,
  customerEmail,
  customerPhone,
  customerAddress,
  equipmentName,
  equipmentType,
  vehicleMake,
  vehicleModel,
  vehicleYear,
  vehicleLicensePlate,
  vehicleVin
}) => {
  const vehicleInfo = vehicleMake && vehicleModel && vehicleYear 
    ? `${vehicleYear} ${vehicleMake} ${vehicleModel}`
    : equipmentName;

  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center">
          <User className="h-5 w-5 mr-2 text-blue-600" />
          Selected Customer & Equipment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Customer Information */}
        <div className="bg-white p-4 rounded-lg border">
          <h4 className="font-semibold text-gray-900 mb-3">Customer Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {customerName && (
              <div className="flex items-center">
                <User className="h-4 w-4 text-gray-500 mr-2" />
                <span className="font-medium">{customerName}</span>
              </div>
            )}
            
            {customerEmail && (
              <div className="flex items-center">
                <Mail className="h-4 w-4 text-gray-500 mr-2" />
                <span>{customerEmail}</span>
              </div>
            )}
            
            {customerPhone && (
              <div className="flex items-center">
                <Phone className="h-4 w-4 text-gray-500 mr-2" />
                <span>{customerPhone}</span>
              </div>
            )}
            
            {customerAddress && (
              <div className="flex items-center md:col-span-2">
                <MapPin className="h-4 w-4 text-gray-500 mr-2" />
                <span>{customerAddress}</span>
              </div>
            )}
          </div>
        </div>

        {/* Equipment Information */}
        {vehicleInfo && (
          <div className="bg-white p-4 rounded-lg border">
            <h4 className="font-semibold text-gray-900 mb-3">Equipment Details</h4>
            <div className="space-y-2">
              <div className="flex items-center">
                <Car className="h-4 w-4 text-gray-500 mr-2" />
                <span className="font-medium">{vehicleInfo}</span>
                {equipmentType && (
                  <Badge variant="outline" className="ml-2">
                    {equipmentType}
                  </Badge>
                )}
              </div>
              
              {vehicleLicensePlate && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium">License Plate:</span> {vehicleLicensePlate}
                </div>
              )}
              
              {vehicleVin && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium">VIN:</span> {vehicleVin}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
