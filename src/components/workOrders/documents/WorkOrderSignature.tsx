
import React, { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from '@/lib/supabase';
import { AlertCircle, Save, Undo } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface WorkOrderSignatureProps {
  workOrderId: string;
}

export function WorkOrderSignature({ workOrderId }: WorkOrderSignatureProps) {
  const signatureRef = useRef<SignatureCanvas>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!signatureRef.current || signatureRef.current.isEmpty()) {
      toast({
        title: "Error",
        description: "Please provide a signature before saving",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // Convert signature to blob
      const dataUrl = signatureRef.current.toDataURL('image/png');
      const res = await fetch(dataUrl);
      const blob = await res.blob();

      // Upload to storage
      const fileName = `${workOrderId}/${Date.now()}-signature.png`;
      const { data: fileData, error: uploadError } = await supabase.storage
        .from('work-order-files')
        .upload(fileName, blob);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('work-order-files')
        .getPublicUrl(fileName);

      // Save signature record
      const { error: dbError } = await supabase
        .from('work_order_signatures')
        .insert({
          work_order_id: workOrderId,
          signature_url: publicUrl,
          signature_type: 'customer',
          signed_by: 'Customer', // TODO: Replace with actual customer name
        });

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: "Signature saved successfully",
      });

      // Clear the signature pad
      signatureRef.current.clear();

    } catch (err) {
      console.error('Error saving signature:', err);
      setError('Failed to save signature. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="border rounded-lg p-4">
        <SignatureCanvas
          ref={signatureRef}
          canvasProps={{
            className: 'signature-canvas w-full h-[200px] border rounded',
            style: { backgroundColor: '#fff' }
          }}
        />
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => signatureRef.current?.clear()}
        >
          <Undo className="h-4 w-4 mr-2" />
          Clear
        </Button>
        <Button
          onClick={handleSave}
          disabled={saving}
        >
          <Save className="h-4 w-4 mr-2" />
          Save Signature
        </Button>
      </div>
    </div>
  );
}
