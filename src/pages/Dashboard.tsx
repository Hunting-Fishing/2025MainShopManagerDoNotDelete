
import React, { useState, useEffect } from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { NonprofitAnalyticsDashboard } from '@/components/analytics/NonprofitAnalyticsDashboard';
import { CustomizableDashboard } from '@/components/dashboard/CustomizableDashboard';
import { DashboardCustomization } from '@/components/dashboard/DashboardCustomization';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useDashboardPreferences } from '@/hooks/useDashboardPreferences';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { BarChart3, Heart, Settings2 } from 'lucide-react';
import { RefreshButton } from '@/components/reports/RefreshButton';
import { PerformanceMonitor } from '@/components/dashboard/PerformanceMonitor';

export default function Dashboard() {
  const { isLoading, lastUpdated, refreshData } = useDashboardData();
  const { preferences } = useDashboardPreferences();
  const [activeView, setActiveView] = useState<'default' | 'nonprofit'>('default');
  const [showCustomization, setShowCustomization] = useState(false);

  // Set initial view based on user preferences
  useEffect(() => {
    if (preferences.defaultView) {
      setActiveView(preferences.defaultView);
    }
  }, [preferences.defaultView]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <DashboardHeader />
        <div className="flex gap-2 items-center">
          <RefreshButton 
            onClick={refreshData}
            lastUpdated={lastUpdated}
            isLoading={isLoading}
          />
          <Dialog open={showCustomization} onOpenChange={setShowCustomization}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Settings2 className="h-4 w-4" />
                Customize
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DashboardCustomization onClose={() => setShowCustomization(false)} />
            </DialogContent>
          </Dialog>
          <Button
            variant={activeView === 'default' ? 'default' : 'outline'}
            onClick={() => setActiveView('default')}
            className="flex items-center gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            Standard Dashboard
          </Button>
          <Button
            variant={activeView === 'nonprofit' ? 'default' : 'outline'}
            onClick={() => setActiveView('nonprofit')}
            className="flex items-center gap-2"
          >
            <Heart className="h-4 w-4" />
            Nonprofit Analytics
          </Button>
        </div>
      </div>

      {activeView === 'default' ? (
        <CustomizableDashboard layout={preferences.layout} />
      ) : (
        <NonprofitAnalyticsDashboard />
      )}
      
      <PerformanceMonitor />
    </div>
  );
}
