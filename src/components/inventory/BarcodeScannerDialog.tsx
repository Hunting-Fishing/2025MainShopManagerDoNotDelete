import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useBarcodeScanner, ScanResult } from '@/hooks/inventory/useBarcodeScanner';
import { 
  Camera, 
  CameraOff, 
  Scan, 
  History, 
  Keyboard, 
  CheckCircle,
  AlertCircle,
  Volume2,
  VolumeX
} from 'lucide-react';
import { format } from 'date-fns';

interface BarcodeScannerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (result: ScanResult) => void;
  title?: string;
  continuous?: boolean;
}

export function BarcodeScannerDialog({
  isOpen,
  onClose,
  onScan,
  title = "Barcode Scanner",
  continuous = false
}: BarcodeScannerDialogProps) {
  const [manualCode, setManualCode] = useState('');
  const [beepEnabled, setBeepEnabled] = useState(true);
  const [showManualEntry, setShowManualEntry] = useState(false);

  const {
    isScanning,
    lastScan,
    scanHistory,
    error,
    capabilities,
    videoRef,
    startScanning,
    stopScanning,
    enterManualCode,
    clearHistory,
    isSupported
  } = useBarcodeScanner({
    continuous,
    beepOnScan: beepEnabled,
    onScan: (result) => {
      onScan(result);
      if (!continuous) {
        onClose();
      }
    },
    validateFormat: (code) => {
      // Basic validation - ensure code is not empty and has reasonable length
      return code.length >= 4 && code.length <= 50;
    }
  });

  useEffect(() => {
    if (!isOpen) {
      stopScanning();
    }
  }, [isOpen, stopScanning]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      enterManualCode(manualCode.trim());
      setManualCode('');
      setShowManualEntry(false);
      if (!continuous) {
        onClose();
      }
    }
  };

  const getScanTypeIcon = (type: string) => {
    switch (type) {
      case 'barcode':
        return <Scan className="h-4 w-4" />;
      case 'qr':
        return <Scan className="h-4 w-4" />;
      case 'manual':
        return <Keyboard className="h-4 w-4" />;
      default:
        return <Scan className="h-4 w-4" />;
    }
  };

  const getScanTypeColor = (type: string) => {
    switch (type) {
      case 'barcode':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'qr':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'manual':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scan className="h-5 w-5" />
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Camera Support Check */}
          {!isSupported && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-yellow-800">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">
                    Camera scanning not supported. Use manual entry instead.
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Scanner Controls */}
          <div className="flex flex-wrap gap-2">
            {isSupported && (
              <>
                <Button
                  onClick={isScanning ? stopScanning : startScanning}
                  variant={isScanning ? "destructive" : "default"}
                  className="flex items-center gap-2"
                >
                  {isScanning ? (
                    <>
                      <CameraOff className="h-4 w-4" />
                      Stop Scanning
                    </>
                  ) : (
                    <>
                      <Camera className="h-4 w-4" />
                      Start Camera
                    </>
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => setBeepEnabled(!beepEnabled)}
                  className="flex items-center gap-2"
                >
                  {beepEnabled ? (
                    <>
                      <Volume2 className="h-4 w-4" />
                      Sound On
                    </>
                  ) : (
                    <>
                      <VolumeX className="h-4 w-4" />
                      Sound Off
                    </>
                  )}
                </Button>
              </>
            )}
            
            <Button
              variant="outline"
              onClick={() => setShowManualEntry(!showManualEntry)}
              className="flex items-center gap-2"
            >
              <Keyboard className="h-4 w-4" />
              Manual Entry
            </Button>
            
            {scanHistory.length > 0 && (
              <Button
                variant="outline"
                onClick={clearHistory}
                className="flex items-center gap-2"
              >
                <History className="h-4 w-4" />
                Clear History
              </Button>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-red-800">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">{error}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Camera View */}
          {isSupported && (
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-64 bg-black rounded-lg object-cover ${
                  isScanning ? 'block' : 'hidden'
                }`}
              />
              
              {!isScanning && (
                <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Camera className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Click "Start Camera" to begin scanning</p>
                  </div>
                </div>
              )}
              
              {isScanning && (
                <div className="absolute inset-0 pointer-events-none">
                  {/* Scanning overlay */}
                  <div className="absolute inset-x-0 top-1/2 transform -translate-y-1/2">
                    <div className="h-1 bg-red-500 animate-pulse mx-8"></div>
                  </div>
                  
                  {/* Corner guides */}
                  <div className="absolute top-4 left-4 w-6 h-6 border-l-2 border-t-2 border-white"></div>
                  <div className="absolute top-4 right-4 w-6 h-6 border-r-2 border-t-2 border-white"></div>
                  <div className="absolute bottom-4 left-4 w-6 h-6 border-l-2 border-b-2 border-white"></div>
                  <div className="absolute bottom-4 right-4 w-6 h-6 border-r-2 border-b-2 border-white"></div>
                </div>
              )}
            </div>
          )}

          {/* Manual Entry */}
          {showManualEntry && (
            <Card>
              <CardContent className="p-4">
                <form onSubmit={handleManualSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="manualCode">Enter Barcode Manually</Label>
                    <Input
                      id="manualCode"
                      value={manualCode}
                      onChange={(e) => setManualCode(e.target.value)}
                      placeholder="Enter barcode or product code"
                      className="mt-1"
                    />
                  </div>
                  <Button type="submit" disabled={!manualCode.trim()}>
                    Add Code
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Last Scan Result */}
          {lastScan && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Last Scan</span>
                  <Badge className={getScanTypeColor(lastScan.type)}>
                    <div className="flex items-center gap-1">
                      {getScanTypeIcon(lastScan.type)}
                      {lastScan.type}
                    </div>
                  </Badge>
                </div>
                <p className="font-mono text-lg">{lastScan.code}</p>
                <p className="text-xs text-muted-foreground">
                  {format(lastScan.timestamp, 'MMM dd, yyyy HH:mm:ss')}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Scan History */}
          {scanHistory.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <History className="h-4 w-4" />
                  <span className="font-medium">Recent Scans ({scanHistory.length})</span>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {scanHistory.slice(0, 10).map((scan, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Badge className={getScanTypeColor(scan.type)} variant="outline">
                          {getScanTypeIcon(scan.type)}
                        </Badge>
                        <span className="font-mono">{scan.code}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {format(scan.timestamp, 'HH:mm:ss')}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Instructions */}
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-2">Instructions:</p>
                <ul className="space-y-1 text-xs">
                  <li>• Position barcode within the camera view</li>
                  <li>• Ensure good lighting for best results</li>
                  <li>• Hold steady until the barcode is detected</li>
                  <li>• Use manual entry if camera scanning fails</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}