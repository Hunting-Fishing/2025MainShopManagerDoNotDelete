
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InventoryFormField } from '../InventoryFormField';

interface PricingSectionProps {
  values: any;
  errors: any;
  onChange: (field: string, value: any) => void;
}

export function PricingSection({
  values,
  errors,
  onChange
}: PricingSectionProps) {
  // Calculate per-unit price from total cost and quantity
  const totalCost = values.unit_price || 0;
  const quantity = values.quantity || 1;
  const pricePerUnit = quantity > 0 ? totalCost / quantity : 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Pricing Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InventoryFormField 
              label="Total Cost (All Units)" 
              name="unit_price" 
              type="number" 
              value={values.unit_price || ''} 
              onChange={e => onChange('unit_price', parseFloat(e.target.value) || 0)} 
              error={errors.unit_price} 
              min="0" 
              step="0.01" 
              placeholder="500.00" 
              description="Total cost for all units in this inventory lot"
            />

            <InventoryFormField 
              label="Sell Price Per Unit" 
              name="sell_price_per_unit" 
              type="number" 
              value={values.sell_price_per_unit || ''} 
              onChange={e => onChange('sell_price_per_unit', parseFloat(e.target.value) || 0)} 
              error={errors.sell_price_per_unit} 
              min="0" 
              step="0.01" 
              placeholder="45.00" 
              description="Price per unit (e.g., per lb, per piece)"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InventoryFormField 
              label="Markup Percentage" 
              name="marginMarkup" 
              type="number" 
              value={values.marginMarkup || ''} 
              onChange={e => onChange('marginMarkup', parseFloat(e.target.value) || 0)} 
              error={errors.marginMarkup} 
              min="0" 
              step="0.1" 
              placeholder="50.0" 
              description="Markup percentage over cost"
            />

            <InventoryFormField 
              label="Cost Per Unit" 
              name="cost_per_unit" 
              type="number" 
              value={pricePerUnit.toFixed(2)} 
              onChange={() => {}} // Read-only calculated field
              disabled={true} 
              description="Calculated: Total Cost ÷ Quantity"
            />

            <InventoryFormField 
              label="Total Inventory Value" 
              name="total_value" 
              type="number" 
              value={totalCost.toFixed(2)} 
              onChange={() => {}} // Read-only calculated field
              disabled={true} 
              description="Total value of this inventory lot"
            />
          </div>

          {quantity > 0 && totalCost > 0 && (
            <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
              <h4 className="font-medium text-blue-900 mb-2">Pricing Summary</h4>
              <div className="text-sm text-blue-700 space-y-1">
                <p>Total Cost: ${totalCost.toFixed(2)} for {quantity} units</p>
                <p className="text-lg font-bold">Cost Per Unit: ${pricePerUnit.toFixed(2)} per unit</p>
                {values.sell_price_per_unit && (
                  <p>Profit Per Unit: ${((values.sell_price_per_unit || 0) - pricePerUnit).toFixed(2)}</p>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InventoryFormField 
              label="Date Purchased" 
              name="dateBought" 
              type="date" 
              value={values.dateBought || ''} 
              onChange={e => onChange('dateBought', e.target.value)} 
              error={errors.dateBought}
            />

            <InventoryFormField 
              label="Last Price Update" 
              name="dateLast" 
              type="date" 
              value={values.dateLast || ''} 
              onChange={e => onChange('dateLast', e.target.value)} 
              error={errors.dateLast}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
