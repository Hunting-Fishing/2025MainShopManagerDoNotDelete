
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InventoryFormField } from '../InventoryFormField';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { TAX_PRESETS } from '@/types/inventory';

interface TaxAndFeesSectionProps {
  values: any;
  errors: any;
  onChange: (field: string, value: any) => void;
}

export function TaxAndFeesSection({ values, errors, onChange }: TaxAndFeesSectionProps) {
  const handleTaxToggle = (field: string, checked: boolean) => {
    onChange(field, checked);
    
    // Handle default rates when enabling taxes
    if (checked) {
      if (field === 'gstApplicable' && !values.gstRate) {
        onChange('gstRate', TAX_PRESETS.GST_RATE);
      }
      else if (field === 'pstApplicable' && !values.pstRate) {
        onChange('pstRate', TAX_PRESETS.PST_BC); // Default to BC PST rate
      }
      else if (field === 'hstApplicable' && !values.hstRate) {
        onChange('hstRate', TAX_PRESETS.HST_ON); // Default to Ontario HST rate
      }
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Taxes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* GST Settings */}
            <Card className="border shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <Label htmlFor="gstApplicable" className="text-base font-medium">GST</Label>
                  <Switch
                    id="gstApplicable"
                    checked={!!values.gstApplicable}
                    onCheckedChange={(checked) => handleTaxToggle('gstApplicable', checked)}
                  />
                </div>
                {values.gstApplicable && (
                  <InventoryFormField
                    label="GST Rate (%)"
                    name="gstRate"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={values.gstRate || ''}
                    onChange={(e) => onChange('gstRate', parseFloat(e.target.value) || 0)}
                    error={errors.gstRate}
                    placeholder="5.00"
                    description="Goods and Services Tax rate"
                  />
                )}
              </CardContent>
            </Card>

            {/* PST Settings */}
            <Card className="border shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <Label htmlFor="pstApplicable" className="text-base font-medium">PST</Label>
                  <Switch
                    id="pstApplicable"
                    checked={!!values.pstApplicable}
                    onCheckedChange={(checked) => handleTaxToggle('pstApplicable', checked)}
                  />
                </div>
                {values.pstApplicable && (
                  <InventoryFormField
                    label="PST Rate (%)"
                    name="pstRate"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={values.pstRate || ''}
                    onChange={(e) => onChange('pstRate', parseFloat(e.target.value) || 0)}
                    error={errors.pstRate}
                    placeholder="7.00"
                    description="Provincial Sales Tax rate"
                  />
                )}
              </CardContent>
            </Card>

            {/* HST Settings */}
            <Card className="border shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <Label htmlFor="hstApplicable" className="text-base font-medium">HST</Label>
                  <Switch
                    id="hstApplicable"
                    checked={!!values.hstApplicable}
                    onCheckedChange={(checked) => handleTaxToggle('hstApplicable', checked)}
                  />
                </div>
                {values.hstApplicable && (
                  <InventoryFormField
                    label="HST Rate (%)"
                    name="hstRate"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={values.hstRate || ''}
                    onChange={(e) => onChange('hstRate', parseFloat(e.target.value) || 0)}
                    error={errors.hstRate}
                    placeholder="13.00"
                    description="Harmonized Sales Tax rate"
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Additional Fees</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Core Charge */}
            <Card className="border shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <Label htmlFor="coreChargeApplicable" className="text-base font-medium">Core Charge</Label>
                  <Switch
                    id="coreChargeApplicable"
                    checked={!!values.coreChargeApplicable}
                    onCheckedChange={(checked) => onChange('coreChargeApplicable', checked)}
                  />
                </div>
                {values.coreChargeApplicable && (
                  <InventoryFormField
                    label="Core Charge Amount"
                    name="coreCharge"
                    type="number"
                    step="0.01"
                    min="0"
                    value={values.coreCharge || ''}
                    onChange={(e) => onChange('coreCharge', parseFloat(e.target.value) || 0)}
                    error={errors.coreCharge}
                    placeholder="0.00"
                    description="Refundable core deposit amount"
                  />
                )}
              </CardContent>
            </Card>

            {/* Hazardous Fee */}
            <Card className="border shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <Label htmlFor="hazardousFeeApplicable" className="text-base font-medium">Hazardous Material Fee</Label>
                  <Switch
                    id="hazardousFeeApplicable"
                    checked={!!values.hazardousFeeApplicable}
                    onCheckedChange={(checked) => onChange('hazardousFeeApplicable', checked)}
                  />
                </div>
                {values.hazardousFeeApplicable && (
                  <InventoryFormField
                    label="Hazardous Fee Amount"
                    name="hazardousFee"
                    type="number"
                    step="0.01"
                    min="0"
                    value={values.hazardousFee || ''}
                    onChange={(e) => onChange('hazardousFee', parseFloat(e.target.value) || 0)}
                    error={errors.hazardousFee}
                    placeholder="0.00"
                    description="Fee for hazardous material handling"
                  />
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InventoryFormField
              label="Shipping Fee"
              name="shippingFee"
              type="number"
              step="0.01"
              min="0"
              value={values.shippingFee || ''}
              onChange={(e) => onChange('shippingFee', parseFloat(e.target.value) || 0)}
              error={errors.shippingFee}
              placeholder="0.00"
              description="Default shipping fee for this item"
            />

            <InventoryFormField
              label="Other Fees"
              name="otherFees"
              type="number"
              step="0.01"
              min="0"
              value={values.otherFees || ''}
              onChange={(e) => onChange('otherFees', parseFloat(e.target.value) || 0)}
              error={errors.otherFees}
              placeholder="0.00"
              description="Any additional fees"
            />
          </div>

          <InventoryFormField
            label="Fee Description"
            name="feeDescription"
            value={values.feeDescription || ''}
            onChange={(e) => onChange('feeDescription', e.target.value)}
            error={errors.feeDescription}
            placeholder="Description of additional fees"
          />
        </CardContent>
      </Card>
    </div>
  );
}
