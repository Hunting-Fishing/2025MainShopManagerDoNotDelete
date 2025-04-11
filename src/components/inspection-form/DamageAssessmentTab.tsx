
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function DamageAssessmentTab() {
  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="windshield">Windshield Condition</Label>
            <Select defaultValue="good">
              <SelectTrigger>
                <SelectValue placeholder="Select condition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="good">Good</SelectItem>
                <SelectItem value="chipped">Chipped</SelectItem>
                <SelectItem value="cracked">Cracked</SelectItem>
                <SelectItem value="broken">Broken</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="exterior">Exterior Condition</Label>
            <Select defaultValue="good">
              <SelectTrigger>
                <SelectValue placeholder="Select condition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="good">Good</SelectItem>
                <SelectItem value="scratched">Scratched</SelectItem>
                <SelectItem value="dented">Dented</SelectItem>
                <SelectItem value="rusty">Rusty</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tires">Tire Condition</Label>
            <Select defaultValue="good">
              <SelectTrigger>
                <SelectValue placeholder="Select condition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="good">Good</SelectItem>
                <SelectItem value="fair">Fair</SelectItem>
                <SelectItem value="worn">Worn</SelectItem>
                <SelectItem value="needs-replacement">Needs Replacement</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="lights">Light Functionality</Label>
            <Select defaultValue="working">
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="working">All Working</SelectItem>
                <SelectItem value="headlight-issue">Headlight Issue</SelectItem>
                <SelectItem value="taillight-issue">Taillight Issue</SelectItem>
                <SelectItem value="multiple-issues">Multiple Issues</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="col-span-1 md:col-span-2 space-y-2">
            <Label htmlFor="damage-notes">Detailed Damage Notes</Label>
            <Textarea 
              id="damage-notes"
              placeholder="Describe any existing damage in detail"
              rows={5}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
