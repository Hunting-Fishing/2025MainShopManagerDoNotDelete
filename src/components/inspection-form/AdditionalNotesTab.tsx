
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

export function AdditionalNotesTab() {
  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="space-y-6">
          <div>
            <Label htmlFor="customer-concerns" className="mb-2 block">Customer Concerns</Label>
            <Textarea 
              id="customer-concerns"
              placeholder="Enter any concerns mentioned by the customer"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="technician-notes" className="mb-2 block">Technician Notes</Label>
            <Textarea 
              id="technician-notes"
              placeholder="Enter any technical observations"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="recommended-services" className="mb-2 block">Recommended Services</Label>
              <Textarea 
                id="recommended-services"
                placeholder="List any recommended services"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="parts-required" className="mb-2 block">Parts Required</Label>
              <Textarea 
                id="parts-required"
                placeholder="List any required parts"
                rows={3}
              />
            </div>
          </div>

          <div className="space-y-4">
            <Label className="mb-2 block">Follow-up Items</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="follow-up-call" />
                <label
                  htmlFor="follow-up-call"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Customer requires follow-up call
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="order-parts" />
                <label
                  htmlFor="order-parts"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Parts need to be ordered
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="schedule-service" />
                <label
                  htmlFor="schedule-service"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Schedule service appointment
                </label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="follow-up-date">Follow-up Date</Label>
              <Input 
                id="follow-up-date"
                type="date"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="inspector-name">Inspector Name</Label>
              <Input 
                id="inspector-name"
                placeholder="Enter the inspector's name"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
