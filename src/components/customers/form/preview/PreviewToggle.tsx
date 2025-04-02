
import React from "react";
import { CustomerFormValues } from "../CustomerFormSchema";
import { CustomerPreview } from "./CustomerPreview";

interface PreviewToggleProps {
  formData: CustomerFormValues;
}

export const PreviewToggle: React.FC<PreviewToggleProps> = ({ formData }) => {
  const [showPreview, setShowPreview] = React.useState(false);
  
  return (
    <>
      <div className="flex justify-end mb-4">
        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
        >
          {showPreview ? "Hide Preview" : "Show Preview"}
        </button>
      </div>

      {showPreview && (
        <div className="mb-6">
          <CustomerPreview customerData={formData} />
        </div>
      )}
    </>
  );
};
