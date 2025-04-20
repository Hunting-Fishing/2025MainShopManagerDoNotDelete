
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FileImage, FileText, Upload, FileUp, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWorkOrderAttachments } from "@/hooks/workOrders/useWorkOrderAttachments";
import { cn } from "@/lib/utils";

interface WorkOrderAttachmentsProps {
  workOrderId: string;
}

export function WorkOrderAttachments({ workOrderId }: WorkOrderAttachmentsProps) {
  const { attachments, isUploading, error, uploadFile } = useWorkOrderAttachments(workOrderId);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    
    Array.from(files).forEach(file => {
      uploadFile(file);
    });
  };

  const renderAttachment = (attachment: WorkOrderAttachment) => {
    const isImage = attachment.fileType.startsWith('image/');

    return (
      <div 
        key={attachment.id} 
        className="relative group p-4 border rounded-lg hover:border-blue-500 transition-colors"
      >
        <div className="aspect-square w-full overflow-hidden rounded-md mb-2">
          {isImage ? (
            <img 
              src={attachment.thumbnailUrl} 
              alt={attachment.fileName}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-slate-100">
              <FileText className="h-10 w-10 text-slate-400" />
            </div>
          )}
        </div>
        
        <div className="text-sm truncate" title={attachment.fileName}>
          {attachment.fileName}
        </div>
        
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded-lg">
          <Button
            variant="secondary"
            size="sm"
            className="h-8 px-2"
            onClick={() => window.open(attachment.fileUrl, '_blank')}
          >
            <FileUp className="h-4 w-4" />
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="h-8 px-2"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
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
            <label 
              className={cn(
                "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer",
                "bg-gray-50 hover:bg-gray-100",
                isUploading && "pointer-events-none opacity-50"
              )}
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {isUploading ? (
                  <>
                    <Upload className="w-8 h-8 mb-3 text-gray-400 animate-bounce" />
                    <p className="text-sm text-gray-500">Uploading...</p>
                  </>
                ) : (
                  <>
                    <FileImage className="w-8 h-8 mb-3 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">Images, PDFs, or documents</p>
                  </>
                )}
              </div>
              <input 
                type="file" 
                className="hidden" 
                multiple 
                onChange={handleFileUpload}
                accept="image/*,.pdf,.doc,.docx"
                disabled={isUploading}
              />
            </label>
          </div>
          
          {error && (
            <div className="text-sm text-red-500 bg-red-50 p-2 rounded">
              {error}
            </div>
          )}
          
          {attachments.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {attachments.map(renderAttachment)}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
