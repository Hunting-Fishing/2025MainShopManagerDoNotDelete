
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { VinDecodeResult } from '@/types/vehicle';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Info } from 'lucide-react';

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
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Info className="h-4 w-4 text-blue-600" />
              VIN Decoded Information
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
              {decodedDetails.year && (
                <div>
                  <span className="font-medium">Year:</span>
                  <Badge variant="outline" className="ml-1">{decodedDetails.year}</Badge>
                </div>
              )}
              {decodedDetails.make && (
                <div>
                  <span className="font-medium">Make:</span>
                  <Badge variant="outline" className="ml-1">{decodedDetails.make}</Badge>
                </div>
              )}
              {decodedDetails.model && decodedDetails.model !== 'Unknown' && (
                <div>
                  <span className="font-medium">Model:</span>
                  <Badge variant="outline" className="ml-1">{decodedDetails.model}</Badge>
                </div>
              )}
              {decodedDetails.country && (
                <div>
                  <span className="font-medium">Country:</span>
                  <Badge variant="outline" className="ml-1">{decodedDetails.country}</Badge>
                </div>
              )}
              {decodedDetails.transmission && (
                <div>
                  <span className="font-medium">Transmission:</span>
                  <Badge variant="outline" className="ml-1">{decodedDetails.transmission}</Badge>
                </div>
              )}
              {decodedDetails.fuel_type && (
                <div>
                  <span className="font-medium">Fuel:</span>
                  <Badge variant="outline" className="ml-1">{decodedDetails.fuel_type}</Badge>
                </div>
              )}
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

      <FormField
        control={form.control}
        name={`vehicles.${index}.notes`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Notes</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Additional vehicle notes or details" />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
};
