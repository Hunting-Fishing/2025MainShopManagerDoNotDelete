
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InventoryFormField } from '../InventoryFormField';
import { Badge } from '@/components/ui/badge';

interface PricingSectionProps {
  values: any;
  errors: any;
  onChange: (field: string, value: any) => void;
}

export function PricingSection({ values, errors, onChange }: PricingSectionProps) {
  const calculateMargin = () => {
    const cost = parseFloat(values.cost || '0');
    const price = parseFloat(values.unit_price || '0');
    if (cost > 0 && price > 0) {
      const margin = ((price - cost) / price) * 100;
      return margin.toFixed(2);
    }
    return '0.00';
  };

  const calculateMarkup = () => {
    const cost = parseFloat(values.cost || '0');
    const price = parseFloat(values.unit_price || '0');
    if (cost > 0 && price > 0) {
      const markup = ((price - cost) / cost) * 100;
      return markup.toFixed(2);
    }
    return '0.00';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Cost & Pricing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InventoryFormField
              label="Unit Cost"
              name="cost"
              type="number"
              step="0.01"
              min="0"
              value={values.cost || ''}
              onChange={(e) => onChange('cost', parseFloat(e.target.value) || 0)}
              error={errors.cost}
              placeholder="0.00"
              description="Your cost for this item"
            />

            <InventoryFormField
              label="Unit Price"
              name="unit_price"
              type="number"
              step="0.01"
              min="0"
              value={values.unit_price || ''}
              onChange={(e) => onChange('unit_price', parseFloat(e.target.value) || 0)}
              error={errors.unit_price}
              placeholder="0.00"
              description="Selling price per unit"
              required
            />

            <InventoryFormField
              label="List Price (MSRP)"
              name="msrp"
              type="number"
              step="0.01"
              min="0"
              value={values.msrp || ''}
              onChange={(e) => onChange('msrp', parseFloat(e.target.value) || 0)}
              error={errors.msrp}
              placeholder="0.00"
              description="Manufacturer suggested retail price"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InventoryFormField
              label="Last Cost"
              name="lastCost"
              type="number"
              step="0.01"
              min="0"
              value={values.lastCost || ''}
              onChange={(e) => onChange('lastCost', parseFloat(e.target.value) || 0)}
              error={errors.lastCost}
              placeholder="0.00"
              description="Most recent purchase cost"
            />

            <InventoryFormField
              label="Average Cost"
              name="averageCost"
              type="number"
              step="0.01"
              min="0"
              value={values.averageCost || ''}
              onChange={(e) => onChange('averageCost', parseFloat(e.target.value) || 0)}
              error={errors.averageCost}
              placeholder="0.00"
              description="Average cost over time"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InventoryFormField
              label="Discount Percentage"
              name="discountPercent"
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={values.discountPercent || ''}
              onChange={(e) => onChange('discountPercent', parseFloat(e.target.value) || 0)}
              error={errors.discountPercent}
              placeholder="0.00"
              description="Standard discount percentage"
            />

            <InventoryFormField
              label="Markup Percentage"
              name="marginMarkup"
              type="number"
              step="0.01"
              min="0"
              value={values.marginMarkup || ''}
              onChange={(e) => onChange('marginMarkup', parseFloat(e.target.value) || 0)}
              error={errors.marginMarkup}
              placeholder="0.00"
              description="Standard markup percentage"
            />
          </div>

          {values.cost && values.unit_price && (
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium mb-2">Calculated Metrics</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Margin: </span>
                  <Badge variant="outline" className="ml-2 bg-green-50 text-green-800">
                    {calculateMargin()}%
                  </Badge>
                </div>
                <div>
                  <span className="text-muted-foreground">Markup: </span>
                  <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-800">
                    {calculateMarkup()}%
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
