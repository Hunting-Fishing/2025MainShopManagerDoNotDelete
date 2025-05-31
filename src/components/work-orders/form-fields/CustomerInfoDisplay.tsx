
import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Phone, Mail, MapPin, Car, Wrench } from "lucide-react";

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
  return (
    <div className="space-y-4">
      {/* Customer Information */}
      <Card className="p-4">
        <h4 className="font-semibold mb-3 flex items-center">
          <User className="h-4 w-4 mr-2" />
          Customer Information
        </h4>
        <div className="space-y-2">
          <div className="flex items-center text-sm">
            <User className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="font-medium">{customerName}</span>
          </div>
          {customerEmail && (
            <div className="flex items-center text-sm">
              <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{customerEmail}</span>
            </div>
          )}
          {customerPhone && (
            <div className="flex items-center text-sm">
              <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{customerPhone}</span>
            </div>
          )}
          {customerAddress && (
            <div className="flex items-center text-sm">
              <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{customerAddress}</span>
            </div>
          )}
        </div>
      </Card>

      {/* Vehicle Information */}
      {(vehicleMake || vehicleModel || vehicleYear) && (
        <Card className="p-4">
          <h4 className="font-semibold mb-3 flex items-center">
            <Car className="h-4 w-4 mr-2" />
            Vehicle Information
          </h4>
          <div className="space-y-2">
            <div className="flex items-center text-sm">
              <span className="font-medium">
                {vehicleYear} {vehicleMake} {vehicleModel}
              </span>
            </div>
            {vehicleLicensePlate && (
              <div className="flex items-center text-sm">
                <span className="text-muted-foreground mr-2">License Plate:</span>
                <Badge variant="outline">{vehicleLicensePlate}</Badge>
              </div>
            )}
            {vehicleVin && (
              <div className="flex items-center text-sm">
                <span className="text-muted-foreground mr-2">VIN:</span>
                <span className="font-mono text-xs">{vehicleVin}</span>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Equipment Information */}
      {(equipmentName || equipmentType) && (
        <Card className="p-4">
          <h4 className="font-semibold mb-3 flex items-center">
            <Wrench className="h-4 w-4 mr-2" />
            Equipment Information
          </h4>
          <div className="space-y-2">
            {equipmentName && (
              <div className="flex items-center text-sm">
                <span className="text-muted-foreground mr-2">Equipment:</span>
                <span className="font-medium">{equipmentName}</span>
              </div>
            )}
            {equipmentType && (
              <div className="flex items-center text-sm">
                <span className="text-muted-foreground mr-2">Type:</span>
                <Badge>{equipmentType}</Badge>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};
