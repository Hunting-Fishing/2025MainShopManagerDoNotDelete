
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InventoryFormField } from '../InventoryFormField';
import { InventoryFormSelect } from '../InventoryFormSelect';

interface ProductDetailsSectionProps {
  values: any;
  errors: any;
  onChange: (field: string, value: any) => void;
}

const WEIGHT_UNITS = [
  { value: 'lb', label: 'Pounds (lb)' },
  { value: 'oz', label: 'Ounces (oz)' },
  { value: 'kg', label: 'Kilograms (kg)' },
  { value: 'g', label: 'Grams (g)' }
];

const SHELF_LIFE_UNITS = [
  { value: 'days', label: 'Days' },
  { value: 'months', label: 'Months' },
  { value: 'years', label: 'Years' }
];

const COUNTRIES = [
  { value: 'CA', label: 'Canada' },
  { value: 'US', label: 'United States' },
  { value: 'MX', label: 'Mexico' },
  { value: 'CN', label: 'China' },
  { value: 'JP', label: 'Japan' },
  { value: 'KR', label: 'South Korea' },
  { value: 'DE', label: 'Germany' },
  { value: 'IT', label: 'Italy' },
  { value: 'FR', label: 'France' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'other', label: 'Other' }
];

export function ProductDetailsSection({ values, errors, onChange }: ProductDetailsSectionProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Physical Properties</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex space-x-2">
              <div className="flex-grow">
                <InventoryFormField
                  label="Weight"
                  name="weight"
                  type="number"
                  step="0.01"
                  min="0"
                  value={values.weight || ''}
                  onChange={(e) => onChange('weight', parseFloat(e.target.value) || 0)}
                  error={errors.weight}
                  placeholder="0.00"
                />
              </div>
              <div className="w-1/3">
                <InventoryFormSelect
                  id="weightUnit"
                  label="Unit"
                  value={values.weightUnit || 'lb'}
                  onValueChange={(value) => onChange('weightUnit', value)}
                  options={WEIGHT_UNITS}
                  error={errors.weightUnit}
                />
              </div>
            </div>

            <InventoryFormField
              label="Dimensions"
              name="dimensions"
              value={values.dimensions || ''}
              onChange={(e) => onChange('dimensions', e.target.value)}
              error={errors.dimensions}
              placeholder="L × W × H (e.g. 10 × 5 × 3 in)"
            />

            <InventoryFormField
              label="Batch/Lot Number"
              name="batchNumber"
              value={values.batchNumber || ''}
              onChange={(e) => onChange('batchNumber', e.target.value)}
              error={errors.batchNumber}
              placeholder="Enter batch or lot number"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Product Handling</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex space-x-2">
              <div className="flex-grow">
                <InventoryFormField
                  label="Shelf Life"
                  name="shelfLife"
                  type="number"
                  min="0"
                  value={values.shelfLife || ''}
                  onChange={(e) => onChange('shelfLife', parseInt(e.target.value) || 0)}
                  error={errors.shelfLife}
                  placeholder="0"
                />
              </div>
              <div className="w-1/3">
                <InventoryFormSelect
                  id="shelfLifeUnit"
                  label="Unit"
                  value={values.shelfLifeUnit || 'days'}
                  onValueChange={(value) => onChange('shelfLifeUnit', value)}
                  options={SHELF_LIFE_UNITS}
                  error={errors.shelfLifeUnit}
                />
              </div>
            </div>

            <InventoryFormField
              label="Expiration Date"
              name="expirationDate"
              type="date"
              value={values.expirationDate || ''}
              onChange={(e) => onChange('expirationDate', e.target.value)}
              error={errors.expirationDate}
            />
          </div>

          <div className="grid grid-cols-1 gap-4">
            <InventoryFormField
              label="Temperature Requirements"
              name="temperatureRequirement"
              value={values.temperatureRequirement || ''}
              onChange={(e) => onChange('temperatureRequirement', e.target.value)}
              error={errors.temperatureRequirement}
              placeholder="E.g., Store between 40-70°F"
            />

            <InventoryFormField
              label="Handling Instructions"
              name="handlingInstructions"
              value={values.handlingInstructions || ''}
              onChange={(e) => onChange('handlingInstructions', e.target.value)}
              error={errors.handlingInstructions}
              placeholder="Special handling instructions"
              as="textarea"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Shipping Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InventoryFormSelect
              id="countryOfOrigin"
              label="Country of Origin"
              value={values.countryOfOrigin || ''}
              onValueChange={(value) => onChange('countryOfOrigin', value)}
              options={COUNTRIES}
              error={errors.countryOfOrigin}
            />

            <InventoryFormField
              label="HS Code (Tariff Code)"
              name="hsCode"
              value={values.hsCode || ''}
              onChange={(e) => onChange('hsCode', e.target.value)}
              error={errors.hsCode}
              placeholder="Harmonized System Code"
            />
          </div>

          <InventoryFormField
            label="Warranty Period"
            name="warrantyPeriod"
            value={values.warrantyPeriod || ''}
            onChange={(e) => onChange('warrantyPeriod', e.target.value)}
            error={errors.warrantyPeriod}
            placeholder="E.g., 1 year limited warranty"
          />
        </CardContent>
      </Card>
    </div>
  );
}
