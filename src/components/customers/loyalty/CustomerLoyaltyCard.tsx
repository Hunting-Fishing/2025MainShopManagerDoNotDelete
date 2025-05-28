import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Gift, Star, TrendingUp, Award } from 'lucide-react';
import { Customer } from '@/types/customer';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CustomerLoyaltyCardProps {
  customerLoyalty?: CustomerLoyalty | null;
  isLoading: boolean;
  onAddPoints?: () => void;
  onViewHistory?: () => void;
}

export function CustomerLoyaltyCard({ 
  customerLoyalty, 
  isLoading, 
  onAddPoints, 
  onViewHistory 
}: CustomerLoyaltyCardProps) {
  const [showHistory, setShowHistory] = useState(false);
  const [progress, setProgress] = useState(50); // Example progress value

  const handleAddPoints = () => {
    toast({
      title: "Points Added",
      description: "Successfully added points to customer's loyalty account.",
    });
  };

  const handleViewHistory = () => {
    setShowHistory(true);
  };

  const handleCloseHistory = () => {
    setShowHistory(false);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle>Loyalty Program</CardTitle>
          <Badge className="bg-blue-500 text-white">Gold Tier</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-2xl font-bold">1,250</p>
              <p className="text-sm text-muted-foreground">Current Points</p>
            </div>
            <div>
              <p className="text-2xl font-bold">3,750</p>
              <p className="text-sm text-muted-foreground">Lifetime Points</p>
            </div>
            <div>
              <div className="flex items-center">
                <Award className="h-5 w-5 mr-1 text-amber-500" />
                <span className="text-lg font-medium">Gold</span>
              </div>
              <p className="text-sm text-muted-foreground">Loyalty Tier</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress to Platinum</span>
              <span>750 points needed</span>
            </div>
            <Progress value={progress} />
          </div>
          <div className="flex space-x-2 pt-2">
            <Button variant="outline" onClick={handleAddPoints} className="flex-1">
              Add Points
            </Button>
            <Button variant="outline" onClick={handleViewHistory} className="flex-1">
              View History
            </Button>
          </div>
        </div>
      </CardContent>
      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Loyalty Points History</DialogTitle>
          </DialogHeader>
          <p>History content goes here...</p>
          <Button onClick={handleCloseHistory}>Close</Button>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

