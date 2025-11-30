import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useSafetyDashboard } from '@/hooks/useSafetyDashboard';
import { useDailyInspections } from '@/hooks/useDailyInspections';
import { useDVIR } from '@/hooks/useDVIR';
import { useLiftInspections } from '@/hooks/useLiftInspections';
import {
  SafetyDashboardStats,
  RecentIncidentsList,
  TodayInspectionsCard,
  UnsafeEquipmentAlert,
  SafetyQuickActions,
  CertificationAlertsCard,
  InspectionCompletionWidget,
  TodaysHazardsWidget,
  FlaggedVehiclesCard,
  CriticalDefectsCard
} from '@/components/safety';
import { Shield, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Safety() {
  const { loading, stats, recentIncidents, todayInspections, unsafeLifts, refetch } = useSafetyDashboard();
  const { inspections, loading: inspectionsLoading } = useDailyInspections();
  const { dvirReports, loading: dvirLoading } = useDVIR();
  const { inspections: liftInspections, loading: liftLoading } = useLiftInspections();

  const handleRefresh = () => {
    refetch();
  };

  return (
    <>
      <Helmet>
        <title>Safety Dashboard | Shop Management</title>
        <meta name="description" content="Real-time safety compliance dashboard - track incidents, inspections, certifications, and equipment status" />
      </Helmet>

      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              Safety & Compliance
            </h1>
            <p className="text-muted-foreground mt-1">
              Real-time safety monitoring and compliance tracking
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Stats Overview */}
        <SafetyDashboardStats stats={stats} loading={loading} />

        {/* Quick Actions */}
        <SafetyQuickActions />

        {/* Critical Alerts Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          <CriticalDefectsCard 
            liftInspections={liftInspections} 
            dvirReports={dvirReports} 
            loading={liftLoading || dvirLoading} 
          />
          <FlaggedVehiclesCard 
            dvirReports={dvirReports} 
            loading={dvirLoading} 
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Column */}
          <div className="space-y-6">
            <InspectionCompletionWidget 
              inspections={inspections} 
              loading={inspectionsLoading} 
            />
            <TodaysHazardsWidget 
              inspections={inspections} 
              loading={inspectionsLoading} 
            />
            <RecentIncidentsList incidents={recentIncidents} loading={loading} />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <TodayInspectionsCard inspections={todayInspections} loading={loading} />
            <UnsafeEquipmentAlert unsafeLifts={unsafeLifts} loading={loading} />
            <CertificationAlertsCard />
          </div>
        </div>
      </div>
    </>
  );
}
