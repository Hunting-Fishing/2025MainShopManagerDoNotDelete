import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Calendar, Plus, QrCode, Wrench } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { InspectionScheduleList } from '@/components/safety/scheduling/InspectionScheduleList';
import { CreateScheduleDialog } from '@/components/safety/scheduling/CreateScheduleDialog';
import { QRCodeScanner } from '@/components/safety/qr/QRCodeScanner';
import { AutoWorkOrderRulesPanel } from '@/components/safety/workorder/AutoWorkOrderRulesPanel';
import { OfflineStatusBar } from '@/components/safety/offline/OfflineStatusBar';

export default function InspectionScheduling() {
  const navigate = useNavigate();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const handleStartInspection = (schedule: any) => {
    switch (schedule.inspection_type) {
      case 'vessel':
        navigate(`/safety/vessels/inspect/${schedule.equipment_id}`);
        break;
      case 'forklift':
        navigate(`/safety/equipment/forklift?equipmentId=${schedule.equipment_id}`);
        break;
      default:
        navigate('/safety');
    }
  };

  return (
    <>
      <Helmet>
        <title>Inspection Scheduling | Safety</title>
        <meta name="description" content="Manage recurring inspection schedules, QR codes, and auto work order rules" />
      </Helmet>

      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/safety')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                <Calendar className="h-6 w-6 text-primary" />
                Inspection Scheduling
              </h1>
              <p className="text-muted-foreground">
                Manage recurring schedules and automation rules
              </p>
            </div>
          </div>
          <OfflineStatusBar />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="schedules" className="space-y-4">
          <TabsList>
            <TabsTrigger value="schedules" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Schedules
            </TabsTrigger>
            <TabsTrigger value="scan" className="flex items-center gap-2">
              <QrCode className="h-4 w-4" />
              Scan QR
            </TabsTrigger>
            <TabsTrigger value="rules" className="flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              Auto Rules
            </TabsTrigger>
          </TabsList>

          <TabsContent value="schedules" className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Schedule
              </Button>
            </div>
            <InspectionScheduleList 
              onStartInspection={handleStartInspection}
            />
          </TabsContent>

          <TabsContent value="scan">
            <div className="max-w-md mx-auto">
              <QRCodeScanner />
            </div>
          </TabsContent>

          <TabsContent value="rules">
            <AutoWorkOrderRulesPanel />
          </TabsContent>
        </Tabs>
      </div>

      <CreateScheduleDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </>
  );
}
