
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InventoryFormField } from '../InventoryFormField';
import { InventoryFormSelect } from '../InventoryFormSelect';
import { MeasurementUnit } from '@/types/inventory';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface InventoryManagementSectionProps {
  values: any;
  errors: any;
  onChange: (field: string, value: any) => void;
  measurementUnits: MeasurementUnit[];
}

export function InventoryManagementSection({ 
  values, 
  errors, 
  onChange,
  measurementUnits
}: InventoryManagementSectionProps) {
  // Filter measurement units by type if a measurement type is selected
  const filteredUnits = values.measurementType
    ? measurementUnits.filter(unit => unit.type === values.measurementType)
    : measurementUnits;

  const measurementTypeOptions = [
    { value: 'weight', label: 'Weight' },
    { value: 'volume', label: 'Volume' },
    { value: 'length', label: 'Length' },
    { value: 'count', label: 'Count' },
    { value: 'other', label: 'Other' }
  ];

  const handleUnitTypeChange = (value: string) => {
    onChange('measurementType', value);
    // Reset the unit of measurement when type changes
    if (measurementUnits.find(unit => unit.type === value)) {
      const defaultUnit = measurementUnits.find(unit => unit.type === value)?.value || '';
      onChange('unitOfMeasurement', defaultUnit);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Inventory Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InventoryFormField
              label="Quantity in Stock"
              name="quantity"
              type="number"
              min="0"
              step="1"
              value={values.quantity || ''}
              onChange={(e) => onChange('quantity', parseInt(e.target.value) || 0)}
              error={errors.quantity}
              placeholder="0"
              required
            />

            <InventoryFormField
              label="Reserved Quantity"
              name="onHold"
              type="number"
              min="0"
              step="1"
              value={values.onHold || ''}
              onChange={(e) => onChange('onHold', parseInt(e.target.value) || 0)}
              error={errors.onHold}
              placeholder="0"
              description="Quantity reserved for pending orders"
            />

            <InventoryFormField
              label="On Order Quantity"
              name="onOrder"
              type="number"
              min="0"
              step="1"
              value={values.onOrder || ''}
              onChange={(e) => onChange('onOrder', parseInt(e.target.value) || 0)}
              error={errors.onOrder}
              placeholder="0"
              description="Quantity on order from supplier"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InventoryFormField
              label="Reorder Point"
              name="reorder_point"
              type="number"
              min="0"
              step="1"
              value={values.reorder_point || ''}
              onChange={(e) => onChange('reorder_point', parseInt(e.target.value) || 0)}
              error={errors.reorder_point}
              placeholder="0"
              description="When to reorder this item"
            />

            <InventoryFormField
              label="Minimum Quantity"
              name="minQuantity"
              type="number"
              min="0"
              step="1"
              value={values.minQuantity || ''}
              onChange={(e) => onChange('minQuantity', parseInt(e.target.value) || 0)}
              error={errors.minQuantity}
              placeholder="0"
              description="Absolute minimum level"
            />

            <InventoryFormField
              label="Maximum Quantity"
              name="maxQuantity"
              type="number"
              min="0"
              step="1"
              value={values.maxQuantity || ''}
              onChange={(e) => onChange('maxQuantity', parseInt(e.target.value) || 0)}
              error={errors.maxQuantity}
              placeholder="0"
              description="Maximum stock to maintain"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <InventoryFormSelect
              id="measurementType"
              label="Measurement Type"
              value={values.measurementType || 'count'}
              onValueChange={handleUnitTypeChange}
              options={measurementTypeOptions}
              error={errors.measurementType}
            />

            <InventoryFormSelect
              id="unitOfMeasurement"
              label="Unit of Measurement"
              value={values.unitOfMeasurement || 'each'}
              onValueChange={(value) => onChange('unitOfMeasurement', value)}
              options={filteredUnits}
              error={errors.unitOfMeasurement}
            />

            <InventoryFormField
              label="Optimal Quantity"
              name="optimalQuantity"
              type="number"
              min="0"
              step="1"
              value={values.optimalQuantity || ''}
              onChange={(e) => onChange('optimalQuantity', parseInt(e.target.value) || 0)}
              error={errors.optimalQuantity}
              placeholder="0"
              description="Ideal inventory level"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InventoryFormField
              label="Bin/Shelf Location"
              name="binLocation"
              value={values.binLocation || ''}
              onChange={(e) => onChange('binLocation', e.target.value)}
              error={errors.binLocation}
              placeholder="Enter bin or shelf location"
              description="Where this item is stored"
            />

            <InventoryFormField
              label="Location"
              name="location"
              value={values.location || ''}
              onChange={(e) => onChange('location', e.target.value)}
              error={errors.location}
              placeholder="Enter location"
              description="Warehouse/store location"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="serialNumberRequired">Tracking Options</Label>
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center space-x-2 pt-1">
                  <Checkbox
                    id="serialNumberRequired"
                    checked={!!values.serialNumberRequired}
                    onCheckedChange={(checked) => onChange('serialNumberRequired', !!checked)}
                  />
                  <label
                    htmlFor="serialNumberRequired"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Track Serial Numbers
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="lotNumberRequired"
                    checked={!!values.lotNumberRequired}
                    onCheckedChange={(checked) => onChange('lotNumberRequired', !!checked)}
                  />
                  <label
                    htmlFor="lotNumberRequired"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Track Lot Numbers
                  </label>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
