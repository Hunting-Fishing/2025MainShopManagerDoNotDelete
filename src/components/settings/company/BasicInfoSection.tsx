
import React from "react";
import { FormField } from "@/components/ui/form-field";
import { LogoUploadSection } from "./LogoUploadSection";

interface BasicInfoSectionProps {
  companyInfo: {
    name: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    phone: string;
    email: string;
    logoUrl: string;
  };
  uploadingLogo: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function BasicInfoSection({
  companyInfo,
  uploadingLogo,
  onInputChange,
  onFileUpload
}: BasicInfoSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="md:col-span-2 flex flex-col md:flex-row gap-6">
        <LogoUploadSection
          logoUrl={companyInfo.logoUrl}
          isUploading={uploadingLogo}
          onFileUpload={onFileUpload}
        />

        <div className="flex-1">
          <FormField
            label="Company Name"
            id="company-name"
            value={companyInfo.name}
            onChange={onInputChange}
            required
          />
        </div>
      </div>

      <FormField
        label="Address"
        id="company-address"
        value={companyInfo.address}
        onChange={onInputChange}
      />

      <FormField
        label="City"
        id="company-city"
        value={companyInfo.city}
        onChange={onInputChange}
      />

      <FormField
        label="State"
        id="company-state"
        value={companyInfo.state}
        onChange={onInputChange}
      />

      <FormField
        label="Zip Code"
        id="company-zip"
        value={companyInfo.zip}
        onChange={onInputChange}
      />

      <FormField
        label="Phone"
        id="company-phone"
        value={companyInfo.phone}
        onChange={onInputChange}
        inputClassName="w-full"
      />

      <FormField
        label="Email"
        id="company-email"
        type="email"
        value={companyInfo.email}
        onChange={onInputChange}
        inputClassName="w-full"
      />
    </div>
  );
}
