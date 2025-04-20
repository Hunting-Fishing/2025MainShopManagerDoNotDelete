
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FileImage, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WorkOrderAttachmentsProps {
  workOrderId: string;
}

export function WorkOrderAttachments({ workOrderId }: WorkOrderAttachmentsProps) {
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    
    // TODO: Implement file upload logic with Supabase storage
    console.log("Files to upload:", files);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="h-5 w-5" />
          Attachments
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <FileImage className="w-8 h-8 mb-3 text-gray-400" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">Images, PDFs, or documents</p>
              </div>
              <input 
                type="file" 
                className="hidden" 
                multiple 
                onChange={handleFileUpload}
                accept="image/*,.pdf,.doc,.docx"
              />
            </label>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* File previews will go here */}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
