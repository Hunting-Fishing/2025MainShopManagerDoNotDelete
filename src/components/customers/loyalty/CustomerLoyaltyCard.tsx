
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Award } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface CustomerLoyalty {
  current_points: number;
  lifetime_points: number;
  tier: string;
}

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
  const [progress, setProgress] = useState(50);
  const { toast } = useToast();

  const handleAddPoints = () => {
    toast({
      title: "Points Added",
      description: "Successfully added points to customer's loyalty account.",
    });
    if (onAddPoints) onAddPoints();
  };

  const handleViewHistory = () => {
    setShowHistory(true);
    if (onViewHistory) onViewHistory();
  };

  const handleCloseHistory = () => {
    setShowHistory(false);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loyalty Program</CardTitle>
        </CardHeader>
        <CardContent>
          <div>Loading loyalty information...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle>Loyalty Program</CardTitle>
          <Badge className="bg-blue-500 text-white">
            {customerLoyalty?.tier || 'Gold'} Tier
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-2xl font-bold">{customerLoyalty?.current_points || 1250}</p>
              <p className="text-sm text-muted-foreground">Current Points</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{customerLoyalty?.lifetime_points || 3750}</p>
              <p className="text-sm text-muted-foreground">Lifetime Points</p>
            </div>
            <div>
              <div className="flex items-center">
                <Award className="h-5 w-5 mr-1 text-amber-500" />
                <span className="text-lg font-medium">{customerLoyalty?.tier || 'Gold'}</span>
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
