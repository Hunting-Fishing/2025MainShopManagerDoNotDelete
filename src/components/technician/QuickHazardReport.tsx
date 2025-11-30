import React, { useState } from 'react';
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { AlertTriangle, Camera, MapPin, Send, Loader2 } from 'lucide-react';
import { useTechnicianOfflineStorage } from '@/hooks/useTechnicianOfflineStorage';
import { useShopId } from '@/hooks/useShopId';
import { usePWA } from '@/hooks/usePWA';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface QuickHazardReportProps {
  trigger?: React.ReactNode;
}

type Severity = 'low' | 'medium' | 'high' | 'critical';

export function QuickHazardReport({ trigger }: QuickHazardReportProps) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { shopId } = useShopId();
  const { isOffline } = usePWA();
  const { addToQueue } = useTechnicianOfflineStorage();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    severity: 'medium' as Severity,
    photoUrl: ''
  });

  const severityOptions: { value: Severity; label: string; color: string }[] = [
    { value: 'low', label: 'Low', color: 'text-green-600 border-green-600' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-600 border-yellow-600' },
    { value: 'high', label: 'High', color: 'text-orange-600 border-orange-600' },
    { value: 'critical', label: 'Critical', color: 'text-red-600 border-red-600' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a hazard title',
        variant: 'destructive'
      });
      return;
    }

    setSubmitting(true);

    try {
      const { data: userData } = await supabase.auth.getUser();
      
      const hazardData = {
        shopId,
        reportedBy: userData.user?.id,
        incidentDate: new Date().toISOString().split('T')[0],
        incidentTime: new Date().toTimeString().split(' ')[0],
        incidentType: 'hazard',
        severity: formData.severity,
        location: formData.location,
        title: formData.title,
        description: formData.description
      };

      if (isOffline) {
        await addToQueue('hazard_report', hazardData);
        toast({
          title: 'Hazard Reported (Offline)',
          description: 'Report saved and will sync when online'
        });
      } else {
        const { error } = await supabase
          .from('safety_incidents' as any)
          .insert({
            shop_id: shopId,
            reported_by: userData.user?.id,
            incident_date: hazardData.incidentDate,
            incident_time: hazardData.incidentTime,
            incident_type: 'hazard',
            severity: formData.severity,
            location: formData.location,
            title: formData.title,
            description: formData.description,
            investigation_status: 'reported'
          });

        if (error) throw error;

        toast({
          title: 'Hazard Reported',
          description: 'Your hazard report has been submitted'
        });
      }

      // Reset form
      setFormData({
        title: '',
        description: '',
        location: '',
        severity: 'medium',
        photoUrl: ''
      });
      setOpen(false);
    } catch (err: any) {
      console.error('Error submitting hazard:', err);
      
      // Queue for offline sync on error
      const { data: userData } = await supabase.auth.getUser();
      await addToQueue('hazard_report', {
        shopId,
        reportedBy: userData.user?.id,
        incidentDate: new Date().toISOString().split('T')[0],
        incidentTime: new Date().toTimeString().split(' ')[0],
        incidentType: 'hazard',
        severity: formData.severity,
        location: formData.location,
        title: formData.title,
        description: formData.description
      });
      
      toast({
        title: 'Saved for Later',
        description: 'Report saved offline due to connection issue',
        variant: 'destructive'
      });
      
      setOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger || (
          <Button 
            size="lg" 
            variant="destructive"
            className="w-full h-16 text-lg font-semibold"
          >
            <AlertTriangle className="h-6 w-6 mr-2" />
            Report Hazard
          </Button>
        )}
      </SheetTrigger>
      
      <SheetContent side="bottom" className="h-[90vh] rounded-t-xl">
        <SheetHeader className="text-left pb-4">
          <SheetTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Quick Hazard Report
          </SheetTitle>
          <SheetDescription>
            Report safety hazards immediately. {isOffline && '(Offline mode - will sync later)'}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Severity Selection */}
          <div className="space-y-2">
            <Label>Severity Level</Label>
            <RadioGroup
              value={formData.severity}
              onValueChange={(value) => setFormData(prev => ({ ...prev, severity: value as Severity }))}
              className="grid grid-cols-4 gap-2"
            >
              {severityOptions.map((option) => (
                <div key={option.value}>
                  <RadioGroupItem
                    value={option.value}
                    id={`severity-${option.value}`}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={`severity-${option.value}`}
                    className={cn(
                      "flex items-center justify-center px-3 py-2 border-2 rounded-lg cursor-pointer transition-all",
                      "peer-data-[state=checked]:bg-secondary",
                      formData.severity === option.value ? option.color : "border-muted"
                    )}
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="hazard-title">What's the hazard?</Label>
            <Input
              id="hazard-title"
              placeholder="e.g., Oil spill, broken equipment, exposed wiring"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="h-12 text-base"
              required
            />
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="hazard-location">Location</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
              <Input
                id="hazard-location"
                placeholder="Where is the hazard?"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                className="h-12 text-base pl-10"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="hazard-description">Additional Details</Label>
            <Textarea
              id="hazard-description"
              placeholder="Describe the hazard and any immediate actions taken..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="text-base"
            />
          </div>

          {/* Photo button (placeholder for future implementation) */}
          <Button type="button" variant="outline" className="w-full" disabled>
            <Camera className="h-4 w-4 mr-2" />
            Add Photo (Coming Soon)
          </Button>

          {/* Submit */}
          <Button 
            type="submit" 
            className="w-full h-14 text-lg"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="h-5 w-5 mr-2" />
                Submit Hazard Report
              </>
            )}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
