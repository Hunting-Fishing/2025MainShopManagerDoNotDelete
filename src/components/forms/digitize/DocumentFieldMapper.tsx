import React, { useMemo, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, FileText, Image, MousePointer } from 'lucide-react';

interface DocumentFieldMapperProps {
  documentUrl: string | null;
  fileName?: string;
  onFieldAdd?: (position: { x: number; y: number }) => void;
}

export function DocumentFieldMapper({ documentUrl, fileName, onFieldAdd }: DocumentFieldMapperProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isPdf = useMemo(() => fileName?.toLowerCase().endsWith('.pdf'), [fileName]);
  const isImage = useMemo(
    () => fileName?.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/),
    [fileName]
  );

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!onFieldAdd || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    onFieldAdd({ x, y });
  };

  if (!documentUrl) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <MousePointer className="h-4 w-4" />
            Visual Field Mapping
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 rounded-lg p-8 text-center text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="mb-2">No document attached</p>
            <p className="text-sm">
              Upload a source document to place fields visually.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <MousePointer className="h-4 w-4" />
          Visual Field Mapping
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {isImage ? <Image className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
            <span>{fileName || 'Document'}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(documentUrl, '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-1" />
            Open
          </Button>
        </div>

        {isImage ? (
          <div
            ref={containerRef}
            onClick={handleClick}
            className="relative bg-muted rounded-lg overflow-hidden cursor-crosshair"
          >
            <img
              src={documentUrl}
              alt="Document preview"
              className="w-full max-h-[520px] object-contain"
            />
            <div className="absolute inset-x-0 bottom-0 bg-background/80 text-xs text-muted-foreground px-3 py-2">
              Click on the document to add a field, then rename it in Step 3.
            </div>
          </div>
        ) : (
          <div className="bg-muted/50 rounded-lg p-6 text-center text-muted-foreground">
            <FileText className="h-10 w-10 mx-auto mb-3 opacity-50" />
            <p className="mb-1">Click-to-place is available for images only.</p>
            <p className="text-sm">Use Step 3 to add fields for PDFs.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
