
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileUp, FileText, Trash2, Eye } from "lucide-react";
import { FormUpload } from "@/types/form";
import { formUploads } from "@/data/formTemplatesData";

export const FormUploads = () => {
  const [uploads, setUploads] = useState<FormUpload[]>(formUploads);
  
  const handleDeleteUpload = (id: string) => {
    setUploads(uploads.filter(upload => upload.id !== id));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <FileUp className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4 flex text-sm justify-center">
              <label
                htmlFor="file-upload"
                className="relative cursor-pointer rounded-md font-medium text-primary"
              >
                <span>Upload a file</span>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  className="sr-only"
                  accept=".pdf,.doc,.docx"
                />
              </label>
              <p className="pl-1 text-gray-500">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500">
              PDF, Word Documents up to 10MB
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="font-medium text-lg">Uploaded Forms</h3>
        
        {uploads.length === 0 ? (
          <div className="text-center p-6">
            <p className="text-muted-foreground">No forms uploaded yet</p>
          </div>
        ) : (
          uploads.map((upload) => (
            <div key={upload.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="bg-primary-50 p-2 rounded">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{upload.filename}</p>
                  <div className="flex gap-2 text-sm text-muted-foreground">
                    <span>{upload.filetype}</span>
                    <span>·</span>
                    <span>{upload.filesize}</span>
                    <span>·</span>
                    <span>Uploaded {new Date(upload.uploaded_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => handleDeleteUpload(upload.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
