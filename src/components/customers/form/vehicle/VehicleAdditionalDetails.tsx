
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { VinDecodeResult } from '@/types/vehicle';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Info, Car, CheckCircle } from 'lucide-react';

interface VehicleAdditionalDetailsProps {
  form: UseFormReturn<any>;
  index: number;
  decodedDetails?: VinDecodeResult | null;
}

export const VehicleAdditionalDetails: React.FC<VehicleAdditionalDetailsProps> = ({
  form,
  index,
  decodedDetails
}) => {
  const showDecodedInfo = decodedDetails && Object.keys(decodedDetails).length > 0;

  return (
    <div className="space-y-4 mt-4">
      {showDecodedInfo && (
        <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              VIN Successfully Decoded
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              {decodedDetails.year && (
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-600">Year:</span>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    {decodedDetails.year}
                  </Badge>
                </div>
              )}
              {decodedDetails.make && (
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-600">Make:</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    {decodedDetails.make}
                  </Badge>
                </div>
              )}
              {decodedDetails.model && decodedDetails.model !== 'Unknown' && (
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-600">Model:</span>
                  <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                    {decodedDetails.model}
                  </Badge>
                </div>
              )}
              {decodedDetails.country && (
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-600">Country:</span>
                  <Badge variant="outline" className="border-gray-300">
                    {decodedDetails.country}
                  </Badge>
                </div>
              )}
              {decodedDetails.transmission && (
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-600">Transmission:</span>
                  <Badge variant="outline" className="border-orange-300 text-orange-700">
                    {decodedDetails.transmission}
                  </Badge>
                </div>
              )}
              {decodedDetails.fuel_type && (
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-600">Fuel:</span>
                  <Badge variant="outline" className="border-indigo-300 text-indigo-700">
                    {decodedDetails.fuel_type}
                  </Badge>
                </div>
              )}
            </div>
            <div className="mt-3 text-xs text-gray-500 flex items-center gap-1">
              <Info className="h-3 w-3" />
              This information was automatically extracted from the VIN
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name={`vehicles.${index}.color`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Color</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Vehicle color" />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`vehicles.${index}.trim`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Trim Level</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder={decodedDetails?.trim || "e.g., LT, EX, Premium"}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`vehicles.${index}.engine`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Engine</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder={decodedDetails?.engine || "e.g., 2.4L 4-Cylinder"}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`vehicles.${index}.transmission`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Transmission</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder={decodedDetails?.transmission || "e.g., Automatic, Manual"}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};
