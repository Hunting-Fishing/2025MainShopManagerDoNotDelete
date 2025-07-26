import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

export interface ScanResult {
  code: string;
  timestamp: Date;
  type: 'barcode' | 'qr' | 'manual';
  confidence?: number;
}

interface BarcodeScannerOptions {
  continuous?: boolean;
  beepOnScan?: boolean;
  validateFormat?: (code: string) => boolean;
  onScan?: (result: ScanResult) => void;
  onError?: (error: Error) => void;
}

interface ScannerCapabilities {
  isAvailable: boolean;
  hasCamera: boolean;
  supportedFormats: string[];
  browserSupport: boolean;
}

export function useBarcodeScanner(options: BarcodeScannerOptions = {}) {
  const [isScanning, setIsScanning] = useState(false);
  const [lastScan, setLastScan] = useState<ScanResult | null>(null);
  const [scanHistory, setScanHistory] = useState<ScanResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check scanner capabilities
  const capabilities: ScannerCapabilities = {
    isAvailable: 'navigator' in window && 'mediaDevices' in navigator,
    hasCamera: false, // Will be determined when requesting camera
    supportedFormats: ['CODE128', 'EAN13', 'EAN8', 'UPC', 'QR_CODE'],
    browserSupport: 'BarcodeDetector' in window || 'getUserMedia' in navigator.mediaDevices
  };

  // Start scanning
  const startScanning = useCallback(async () => {
    if (!capabilities.isAvailable) {
      const errorMsg = 'Camera not available on this device';
      setError(errorMsg);
      options.onError?.(new Error(errorMsg));
      return;
    }

    try {
      setIsScanning(true);
      setError(null);

      console.log('🔄 Starting barcode scanner...');

      // For demo purposes, simulate barcode scanning
      // In a real implementation, this would use camera and BarcodeDetector API
      if (!videoRef.current) {
        console.log('📷 Video element not available, using simulation mode');
        
        // Simulate scanning after a delay
        scanTimeoutRef.current = setTimeout(() => {
          const mockScanResult: ScanResult = {
            code: `MOCK${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
            timestamp: new Date(),
            type: 'barcode',
            confidence: 0.95
          };
          
          handleScanResult(mockScanResult);
        }, 2000);
        
        return;
      }

      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      
      console.log('✅ Camera access granted');

      // Start barcode detection (simplified simulation)
      // In real implementation, use BarcodeDetector or external library
      const detectBarcodes = () => {
        if (!isScanning) return;
        
        // Simulate barcode detection
        if (Math.random() < 0.1) { // 10% chance to detect barcode each second
          const mockScanResult: ScanResult = {
            code: `${Math.random() > 0.5 ? 'EAN' : 'UPC'}${Math.random().toString().substr(2, 12)}`,
            timestamp: new Date(),
            type: 'barcode',
            confidence: Math.random() * 0.3 + 0.7 // 70-100% confidence
          };
          
          handleScanResult(mockScanResult);
        }
        
        if (isScanning) {
          setTimeout(detectBarcodes, 1000);
        }
      };

      detectBarcodes();

    } catch (err) {
      console.error('❌ Error starting scanner:', err);
      const errorMsg = 'Failed to access camera. Please check permissions.';
      setError(errorMsg);
      setIsScanning(false);
      options.onError?.(err as Error);
      
      toast({
        title: "Camera Error",
        description: errorMsg,
        variant: "destructive",
      });
    }
  }, [isScanning, options]);

  // Stop scanning
  const stopScanning = useCallback(() => {
    console.log('🛑 Stopping barcode scanner');
    
    setIsScanning(false);
    setError(null);
    
    // Clear timeout
    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current);
      scanTimeoutRef.current = null;
    }
    
    // Stop camera stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    // Clear video source
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // Handle scan result
  const handleScanResult = useCallback((result: ScanResult) => {
    console.log('🔍 Barcode scanned:', result);
    
    // Validate format if validator provided
    if (options.validateFormat && !options.validateFormat(result.code)) {
      toast({
        title: "Invalid Barcode",
        description: "The scanned barcode format is not supported.",
        variant: "destructive",
      });
      return;
    }
    
    // Add to history
    setScanHistory(prev => [result, ...prev.slice(0, 49)]); // Keep last 50 scans
    setLastScan(result);
    
    // Play beep sound if enabled
    if (options.beepOnScan) {
      try {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmUgBDiX4P');
        audio.play().catch(() => {
          // Ignore audio play errors
        });
      } catch (err) {
        // Ignore audio errors
      }
    }
    
    // Call callback if provided
    options.onScan?.(result);
    
    // Stop scanning if not continuous
    if (!options.continuous) {
      stopScanning();
    }
    
    toast({
      title: "Barcode Scanned",
      description: `Successfully scanned: ${result.code}`,
    });
  }, [options, stopScanning]);

  // Manual barcode entry
  const enterManualCode = useCallback((code: string) => {
    const result: ScanResult = {
      code: code.trim().toUpperCase(),
      timestamp: new Date(),
      type: 'manual'
    };
    
    handleScanResult(result);
  }, [handleScanResult]);

  // Clear scan history
  const clearHistory = useCallback(() => {
    setScanHistory([]);
    setLastScan(null);
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, [stopScanning]);

  return {
    // State
    isScanning,
    lastScan,
    scanHistory,
    error,
    capabilities,
    
    // Refs
    videoRef,
    
    // Actions
    startScanning,
    stopScanning,
    enterManualCode,
    clearHistory,
    
    // Utilities
    isSupported: capabilities.browserSupport
  };
}