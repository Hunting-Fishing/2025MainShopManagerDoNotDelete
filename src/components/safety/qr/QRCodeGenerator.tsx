import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Printer, QrCode } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import QRCode from 'qrcode';

interface QRCodeGeneratorProps {
  assetType: 'equipment' | 'vehicle';
  assetId: string;
  assetName: string;
  inspectionType?: string;
}

export function QRCodeGenerator({ 
  assetType, 
  assetId, 
  assetName,
  inspectionType = 'vessel'
}: QRCodeGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const qrData = JSON.stringify({
    type: assetType,
    id: assetId,
    inspection: inspectionType,
    app: 'shop-safety'
  });

  // Generate QR code using QRCode library
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    QRCode.toCanvas(canvas, qrData, { width: 200, margin: 2 }, (err) => {
      if (err) {
        console.error('Error generating QR code:', err);
      }
    });
  }, [qrData]);

  const downloadQR = () => {
    if (!canvasRef.current) return;
    
    const link = document.createElement('a');
    link.download = `qr-${assetName.replace(/\s+/g, '-').toLowerCase()}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
    
    toast({ title: 'QR Code downloaded' });
  };

  const printQR = () => {
    if (!canvasRef.current) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    printWindow.document.write(`
      <html>
        <head><title>QR Code - ${assetName}</title></head>
        <body style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;margin:0;font-family:sans-serif;">
          <h2 style="margin-bottom:20px;">${assetName}</h2>
          <img src="${canvasRef.current.toDataURL('image/png')}" style="width:200px;height:200px;" />
          <p style="margin-top:20px;color:#666;">Scan to start ${inspectionType} inspection</p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const saveQRToDatabase = async () => {
    const table = assetType === 'equipment' ? 'equipment_assets' : 'vehicles';
    
    try {
      const { error } = await supabase
        .from(table)
        .update({ 
          qr_code: qrData,
          qr_code_generated_at: new Date().toISOString()
        })
        .eq('id', assetId);

      if (error) throw error;
      
      toast({ title: 'QR code saved to asset' });
    } catch (error: any) {
      console.error('Error saving QR code:', error);
      toast({
        title: 'Error',
        description: 'Failed to save QR code',
        variant: 'destructive'
      });
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          QR Code
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center">
          <canvas 
            ref={canvasRef} 
            className="border rounded-lg"
            style={{ width: 200, height: 200 }}
          />
        </div>
        
        <p className="text-sm text-center text-muted-foreground">
          Scan to start {inspectionType} inspection for {assetName}
        </p>

        <div className="flex gap-2 justify-center">
          <Button size="sm" variant="outline" onClick={downloadQR}>
            <Download className="h-4 w-4 mr-1" />
            Download
          </Button>
          <Button size="sm" variant="outline" onClick={printQR}>
            <Printer className="h-4 w-4 mr-1" />
            Print
          </Button>
          <Button size="sm" onClick={saveQRToDatabase}>
            Save
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
