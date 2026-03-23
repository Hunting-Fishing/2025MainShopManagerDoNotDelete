import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Camera, Video, StickyNote, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Props {
  templateId: string;
  onClose: () => void;
}

export default function InspectionFormPreview({ templateId, onClose }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: ['septic-inspection-template-preview', templateId],
    queryFn: async () => {
      const { data: tmpl } = await supabase
        .from('septic_inspection_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      const { data: secs } = await supabase
        .from('septic_inspection_template_sections')
        .select('*')
        .eq('template_id', templateId)
        .order('display_order');

      const sectionsWithItems = [];
      for (const sec of secs || []) {
        const { data: items } = await supabase
          .from('septic_inspection_template_items')
          .select('*')
          .eq('section_id', sec.id)
          .order('display_order');
        sectionsWithItems.push({ ...sec, items: items || [] });
      }

      return { template: tmpl, sections: sectionsWithItems };
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const { template, sections } = data || { template: null, sections: [] };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onClose}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-xl font-bold">Preview: {template?.name}</h2>
          <p className="text-sm text-muted-foreground">{template?.description}</p>
        </div>
      </div>

      <div className="border-2 border-dashed border-emerald-300 rounded-xl p-1">
        <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-lg p-4 text-center text-sm text-emerald-700 dark:text-emerald-300 font-medium">
          📋 Preview Mode — This is how the form appears to inspectors
        </div>
      </div>

      {sections.map((sec: any) => (
        <Card key={sec.id}>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">{sec.title}</CardTitle>
            {sec.description && <CardDescription>{sec.description}</CardDescription>}
          </CardHeader>
          <CardContent className="space-y-3">
            {sec.items.map((item: any) => {
              const responseType = item.response_type || 'pass_fail_na';

              return (
                <div key={item.id} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{item.item_name}</span>
                      {item.is_required && <span className="text-xs text-destructive">*</span>}
                    </div>
                    <div className="flex items-center gap-1">
                      {item.allows_notes && <StickyNote className="h-3.5 w-3.5 text-muted-foreground" />}
                      {item.allows_photos && <Camera className="h-3.5 w-3.5 text-muted-foreground" />}
                      {item.allows_videos && <Video className="h-3.5 w-3.5 text-muted-foreground" />}
                    </div>
                  </div>

                  {/* Response UI based on type */}
                  {responseType === 'pass_fail_na' && (
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1 h-9 text-green-700 border-green-300 hover:bg-green-50">✓ Pass</Button>
                      <Button size="sm" variant="outline" className="flex-1 h-9 text-red-700 border-red-300 hover:bg-red-50">✗ Fail</Button>
                      <Button size="sm" variant="outline" className="flex-1 h-9 text-muted-foreground">N/A</Button>
                    </div>
                  )}
                  {responseType === 'gyr_status' && (
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1 h-9 text-green-700 border-green-300 hover:bg-green-50">🟢 Good</Button>
                      <Button size="sm" variant="outline" className="flex-1 h-9 text-yellow-700 border-yellow-300 hover:bg-yellow-50">🟡 Fair</Button>
                      <Button size="sm" variant="outline" className="flex-1 h-9 text-red-700 border-red-300 hover:bg-red-50">🔴 Poor</Button>
                    </div>
                  )}
                  {responseType === 'checkbox' && (
                    <div className="flex items-center gap-2">
                      <Checkbox disabled />
                      <span className="text-sm text-muted-foreground">Check if complete</span>
                    </div>
                  )}
                  {responseType === 'number' && (
                    <div className="flex items-center gap-2">
                      <Input type="number" placeholder="0" className="w-32 h-9" disabled />
                      {item.unit && <span className="text-sm text-muted-foreground">{item.unit}</span>}
                    </div>
                  )}
                  {responseType === 'text' && (
                    <Textarea placeholder="Enter notes..." rows={2} disabled className="text-sm" />
                  )}

                  {/* Notes field preview */}
                  {item.allows_notes && responseType !== 'text' && (
                    <Input placeholder="Add notes..." className="text-xs h-8" disabled />
                  )}

                  {/* Attachment buttons preview */}
                  {(item.allows_photos || item.allows_videos) && (
                    <div className="flex gap-2">
                      {item.allows_photos && (
                        <Button variant="outline" size="sm" className="h-7 text-xs" disabled>
                          <Camera className="h-3 w-3 mr-1" /> Photo
                        </Button>
                      )}
                      {item.allows_videos && (
                        <Button variant="outline" size="sm" className="h-7 text-xs" disabled>
                          <Video className="h-3 w-3 mr-1" /> Video
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      ))}

      <Button variant="outline" onClick={onClose} className="w-full">
        Close Preview
      </Button>
    </div>
  );
}
