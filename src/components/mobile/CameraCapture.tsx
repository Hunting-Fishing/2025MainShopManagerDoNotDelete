import React, { useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Camera, FlipHorizontal, X, Check, RotateCcw } from 'lucide-react';
import { useResponsive } from '@/hooks/useResponsive';

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  onCancel: () => void;
  isOpen: boolean;
  title?: string;
  acceptVideo?: boolean;
  maxFileSize?: number; // in MB
}

export function CameraCapture({
  onCapture,
  onCancel,
  isOpen,
  title = "Take Photo",
  acceptVideo = false,
  maxFileSize = 10
}: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [error, setError] = useState<string | null>(null);
  const { isMobile } = useResponsive();

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: acceptVideo
      });

      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Unable to access camera. Please check permissions.');
    }
  }, [facingMode, acceptVideo]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  const switchCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to blob and create file
    canvas.toBlob((blob) => {
      if (blob) {
        // Check file size
        const fileSizeMB = blob.size / (1024 * 1024);
        if (fileSizeMB > maxFileSize) {
          setError(`File size too large. Maximum ${maxFileSize}MB allowed.`);
          return;
        }

        const file = new File([blob], `photo-${Date.now()}.jpg`, {
          type: 'image/jpeg'
        });

        // Show preview
        setCapturedImage(canvas.toDataURL('image/jpeg', 0.8));
      }
    }, 'image/jpeg', 0.8);
  };

  const confirmCapture = () => {
    if (capturedImage && canvasRef.current) {
      canvasRef.current.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `photo-${Date.now()}.jpg`, {
            type: 'image/jpeg'
          });
          onCapture(file);
          handleClose();
        }
      }, 'image/jpeg', 0.8);
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setError(null);
  };

  const handleClose = () => {
    stopCamera();
    setCapturedImage(null);
    setError(null);
    onCancel();
  };

  // Start camera when dialog opens
  React.useEffect(() => {
    if (isOpen && !stream) {
      startCamera();
    }
    
    return () => {
      if (!isOpen) {
        stopCamera();
      }
    };
  }, [isOpen, startCamera, stopCamera, stream]);

  // Restart camera when facing mode changes
  React.useEffect(() => {
    if (stream && isOpen) {
      stopCamera();
      setTimeout(startCamera, 100);
    }
  }, [facingMode]);

  if (!isMobile) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Camera Not Available</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <Camera className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Camera capture is only available on mobile devices.
            </p>
            <Button onClick={handleClose} className="mt-4">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-full h-full p-0 bg-black">
        <div className="relative h-full flex flex-col">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/50 to-transparent">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-semibold">{title}</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Camera View */}
          <div className="flex-1 relative">
            {!capturedImage ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                
                {error && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <Card className="m-4">
                      <CardContent className="p-4 text-center">
                        <p className="text-destructive mb-4">{error}</p>
                        <Button onClick={startCamera} size="sm">
                          Try Again
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </>
            ) : (
              <img
                src={capturedImage}
                alt="Captured"
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {/* Controls */}
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/50 to-transparent">
            {!capturedImage ? (
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={switchCamera}
                  className="text-white hover:bg-white/10"
                >
                  <FlipHorizontal className="w-5 h-5" />
                </Button>

                <Button
                  size="lg"
                  onClick={capturePhoto}
                  className="rounded-full w-16 h-16 bg-white hover:bg-gray-100"
                  disabled={!stream}
                >
                  <Camera className="w-8 h-8 text-black" />
                </Button>

                <div className="w-10" /> {/* Spacer */}
              </div>
            ) : (
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  onClick={retakePhoto}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Retake
                </Button>

                <Button
                  onClick={confirmCapture}
                  className="bg-success hover:bg-success/90"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Use Photo
                </Button>
              </div>
            )}
          </div>

          {/* Hidden canvas for capturing */}
          <canvas ref={canvasRef} className="hidden" />
        </div>
      </DialogContent>
    </Dialog>
  );
}