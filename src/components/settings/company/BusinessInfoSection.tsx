
import React from "react";
import { Label } from "@/components/ui/label";
import { FormField } from "@/components/ui/form-field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BusinessConstant } from "@/hooks/useBusinessConstants";

interface BusinessInfoSectionProps {
  companyInfo: {
    taxId: string;
    businessType: string;
    industry: string;
  };
  businessTypes: BusinessConstant[];
  businessIndustries: BusinessConstant[];
  isLoadingConstants: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectChange: (field: string, value: string) => void;
}

export function BusinessInfoSection({
  companyInfo,
  businessTypes,
  businessIndustries,
  isLoadingConstants,
  onInputChange,
  onSelectChange
}: BusinessInfoSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormField
        label="Tax ID / EIN"
        id="company-taxId"
        value={companyInfo.taxId}
        onChange={onInputChange}
        description="Your business tax identification number"
      />
      
      <div className="space-y-2">
        <Label htmlFor="business-type">Business Type</Label>
        <Select 
          value={companyInfo.businessType} 
          onValueChange={(value) => onSelectChange('businessType', value)}
          disabled={isLoadingConstants}
        >
          <SelectTrigger id="business-type">
            <SelectValue placeholder="Select business type" />
          </SelectTrigger>
          <SelectContent>
            {businessTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="business-industry">Industry</Label>
        <Select 
          value={companyInfo.industry} 
          onValueChange={(value) => onSelectChange('industry', value)}
          disabled={isLoadingConstants}
        >
          <SelectTrigger id="business-industry">
            <SelectValue placeholder="Select industry" />
          </SelectTrigger>
          <SelectContent>
            {businessIndustries.map((industry) => (
              <SelectItem key={industry.value} value={industry.value}>{industry.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
