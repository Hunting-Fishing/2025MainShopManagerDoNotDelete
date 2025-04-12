
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Image } from "lucide-react";

interface LogoUploadSectionProps {
  logoUrl: string;
  isUploading: boolean;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function LogoUploadSection({ logoUrl, isUploading, onFileUpload }: LogoUploadSectionProps) {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative mb-4 w-32 h-32 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
        {logoUrl ? (
          <img 
            src={logoUrl} 
            alt="Company Logo" 
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="text-center p-4 text-gray-500">
            <Image className="w-10 h-10 mx-auto mb-2" />
            <span className="text-xs">No logo uploaded</span>
          </div>
        )}
      </div>
      <Label
        htmlFor="logo-upload"
        className="cursor-pointer bg-muted hover:bg-muted/80 transition-colors py-1.5 px-3 rounded-md text-sm font-medium"
      >
        {isUploading ? "Uploading..." : "Upload Logo"}
      </Label>
      <Input
        id="logo-upload"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFileUpload}
        disabled={isUploading}
      />
    </div>
  );
}
