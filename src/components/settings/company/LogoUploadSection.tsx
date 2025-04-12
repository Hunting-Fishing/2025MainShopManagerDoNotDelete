
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
      <div className="relative mb-4 w-32 h-32 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50">
        {logoUrl ? (
          <img 
            src={logoUrl} 
            alt="Company Logo" 
            className="object-contain w-full h-full p-1"
            onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
              console.error("Logo image failed to load", logoUrl);
              const target = e.target as HTMLImageElement;
              target.src = ""; // Clear the src to show the fallback
              target.style.display = "none";
              target.parentElement?.classList.add("logo-error");
            }}
          />
        ) : (
          <div className="text-center p-4 text-gray-500">
            <Image className="w-10 h-10 mx-auto mb-2" />
            <span className="text-xs">No logo uploaded</span>
          </div>
        )}
        {logoUrl && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-30 transition-opacity">
            <span className="text-white opacity-0 hover:opacity-100">Change Logo</span>
          </div>
        )}
      </div>
      <Label
        htmlFor="logo-upload"
        className="cursor-pointer bg-muted hover:bg-muted/80 transition-colors py-1.5 px-3 rounded-md text-sm font-medium"
      >
        {isUploading ? "Uploading..." : logoUrl ? "Change Logo" : "Upload Logo"}
      </Label>
      <Input
        id="logo-upload"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFileUpload}
        disabled={isUploading}
      />
      {logoUrl && (
        <p className="mt-2 text-xs text-muted-foreground">
          Logo URL: <span className="font-mono text-[10px] break-all">{logoUrl}</span>
        </p>
      )}
    </div>
  );
}
